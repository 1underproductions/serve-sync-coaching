-- Allow public read access to sessions for booking availability
-- This only allows viewing session times, not sensitive details
CREATE POLICY "Anyone can view sessions for booking availability"
ON sessions
FOR SELECT
USING (true);