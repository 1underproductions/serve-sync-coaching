
-- This migration ensures that both the avatars and blog-images storage buckets exist
-- and have properly configured public access

-- Check if avatars bucket exists, create if not
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM storage.buckets WHERE id = 'avatars'
    ) THEN
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('avatars', 'avatars', true);
    END IF;
END $$;

-- Check if blog-images bucket exists, create if not
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM storage.buckets WHERE id = 'blog-images'
    ) THEN
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('blog-images', 'blog-images', true);
    END IF;
END $$;

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

-- Upload access for authenticated users to avatars bucket using JWT claim
DROP POLICY IF EXISTS "Authenticated can upload avatars" ON storage.objects;
CREATE POLICY "Authenticated can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND owner_id = current_setting('request.jwt.claim.sub', true)::text
);

-- Upload access for authenticated users to blog-images bucket using JWT claim
DROP POLICY IF EXISTS "Authenticated can upload blog images" ON storage.objects;
CREATE POLICY "Authenticated can upload blog images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'blog-images' AND owner_id = current_setting('request.jwt.claim.sub', true)::text
);

