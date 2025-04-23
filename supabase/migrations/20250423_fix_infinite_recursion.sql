
-- Drop the existing function with parameter name issue first
DROP FUNCTION IF EXISTS public.set_user_as_admin(text);

-- Create an improved version of the function with explicit error handling
-- that avoids recursion by using auth.users directly instead of profiles
CREATE OR REPLACE FUNCTION public.set_user_as_admin(input_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id uuid;
  affected_rows int;
BEGIN
  -- First get the user ID from auth.users (bypassing profiles)
  SELECT id INTO user_id FROM auth.users WHERE email = input_email;
  
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
CREATE OR REPLACE FUNCTION public.get_user_role_safely()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  user_role text;
BEGIN
  -- Direct query to profiles table without any policy checks
  SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
  RETURN COALESCE(user_role, 'user');
END;
$$;

-- Update existing policies to use the helper function
-- First, drop any policies that might be causing recursion
DROP POLICY IF EXISTS "Profiles are viewable by owner" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are updatable by owner" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Create the policies with the helper function to avoid recursion
CREATE POLICY "Profiles are viewable by owner" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (public.get_user_role_safely() = 'tennexis_admin');

CREATE POLICY "Profiles are updatable by owner" 
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Admins can update all profiles" 
ON public.profiles FOR UPDATE
USING (public.get_user_role_safely() = 'tennexis_admin');

-- Make sure RLS is enabled on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
