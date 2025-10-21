-- Add RLS policy for user_roles table (fixes INFO warning)
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Only system can assign roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'tennexis_admin'));