
-- Drop the problematic policies that are causing infinite recursion
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow admin access to all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are updatable by owner" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by owner" ON public.profiles;
DROP POLICY IF EXISTS "Profiles updatable by admin" ON public.profiles;
DROP POLICY IF EXISTS "Profiles updatable by owner" ON public.profiles;
DROP POLICY IF EXISTS "Profiles viewable by admin" ON public.profiles;
DROP POLICY IF EXISTS "Profiles viewable by owner" ON public.profiles;
DROP POLICY IF EXISTS "Public coach profile data is viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can access own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view any profile" ON public.profiles;

-- Keep only the simple policies that were created in the recent migration
-- These use direct auth.uid() comparison which avoids recursion
-- The policies "Users can view own profile", "Users can update own profile", and "Users can insert own profile" 
-- should already exist from the migration and use direct auth.uid() = id comparison
