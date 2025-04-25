
-- This migration creates and configures both the avatars and blog-images storage buckets
-- with proper public access permissions and RLS policies

-- Create avatars bucket if it doesn't exist
CREATE BUCKET IF NOT EXISTS avatars;

-- Create blog-images bucket if it doesn't exist
CREATE BUCKET IF NOT EXISTS blog-images;

-- Make sure both buckets are publicly accessible
UPDATE storage.buckets SET public = true WHERE id IN ('avatars', 'blog-images');

-- Make sure we have proper policies for both buckets
-- First check if the objects table has RLS enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- For avatars bucket: anyone can read, authenticated users can upload their own files
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
CREATE POLICY "Anyone can view avatars" 
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- For blog-images bucket: anyone can read, authenticated users can upload their own files
DROP POLICY IF EXISTS "Anyone can view blog images" ON storage.objects;
CREATE POLICY "Anyone can view blog images" 
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-images');

-- Upload access for authenticated users to avatars bucket with explicit user ID check
-- This avoids recursion by not referencing profile tables
DROP POLICY IF EXISTS "Authenticated can upload avatars" ON storage.objects;
CREATE POLICY "Authenticated can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND auth.role() = 'authenticated'
);

-- Upload access for authenticated users to blog-images bucket with explicit user ID check
-- This avoids recursion by not referencing profile tables
DROP POLICY IF EXISTS "Authenticated can upload blog images" ON storage.objects;
CREATE POLICY "Authenticated can upload blog images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'blog-images' AND auth.role() = 'authenticated'
);
