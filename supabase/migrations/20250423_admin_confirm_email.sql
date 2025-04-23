
-- Function to allow bypassing email confirmation for admin accounts
-- This is a workaround for demo purposes to allow admin accounts to be created and logged in without email confirmation
CREATE OR REPLACE FUNCTION public.admin_confirm_email(admin_email TEXT)
RETURNS void AS $$
BEGIN
  -- Update the user's email_confirmed_at column directly in the auth.users table
  -- This bypasses the normal email confirmation flow
  UPDATE auth.users
  SET email_confirmed_at = now()
  WHERE email = admin_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
