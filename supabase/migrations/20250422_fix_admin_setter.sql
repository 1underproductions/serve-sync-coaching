
-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS public.set_user_as_admin(text);

-- Create an improved version of the function with explicit error handling
CREATE OR REPLACE FUNCTION public.set_user_as_admin(email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  affected_rows int;
BEGIN
  -- Update the profile, returning the number of rows affected
  UPDATE public.profiles
  SET role = 'tennexis_admin'
  WHERE email = set_user_as_admin.email
  RETURNING 1 INTO affected_rows;
  
  -- Return true if we updated a row, false otherwise
  RETURN affected_rows = 1;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.set_user_as_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_user_as_admin TO anon;
GRANT EXECUTE ON FUNCTION public.set_user_as_admin TO service_role;
