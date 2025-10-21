-- Allow public read access to basic coach profile information for booking pages
CREATE POLICY "Anyone can view public coach profiles for booking"
ON profiles
FOR SELECT
USING (true);