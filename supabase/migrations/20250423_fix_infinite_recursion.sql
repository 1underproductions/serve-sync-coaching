
-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS public.set_user_as_admin(text);

-- Create an improved version of the function with explicit error handling
-- that avoids recursion by using auth.users directly instead of profiles
CREATE OR REPLACE FUNCTION public.set_user_as_admin(email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id uuid;
  affected_rows int;
BEGIN
  -- First get the user ID from auth.users (bypassing profiles)
  SELECT id INTO user_id FROM auth.users WHERE email = set_user_as_admin.email;
  
  IF user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Update the profile directly using the user ID
  UPDATE public.profiles
  SET role = 'tennexis_admin'
  WHERE id = user_id
  RETURNING 1 INTO affected_rows;
  
  -- Return true if we updated a row, false otherwise
  RETURN affected_rows = 1;
END;
$$;

-- Create a helper function to get the current user's role
-- This prevents infinite recursion in RLS policies
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Update existing policies to use the helper function
-- First, drop any recursive policies on the profiles table
DO $$
BEGIN
  -- Attempt to drop any policies that might be causing recursion
  -- We don't know their names, so we use a generic approach
  BEGIN
    DROP POLICY IF EXISTS "Profiles are viewable by owner" ON public.profiles;
  EXCEPTION WHEN OTHERS THEN
    -- Policy might not exist, just continue
  END;
  
  BEGIN
    DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
  EXCEPTION WHEN OTHERS THEN
    -- Policy might not exist, just continue
  END;
END;
$$;

-- Create the policies with the helper function to avoid recursion
CREATE POLICY "Profiles are viewable by owner" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (public.get_current_user_role() = 'tennexis_admin');
