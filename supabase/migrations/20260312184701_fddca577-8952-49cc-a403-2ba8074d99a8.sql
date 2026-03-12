
-- Fix overly permissive system_logs insert policy
DROP POLICY IF EXISTS "System can insert logs" ON public.system_logs;
CREATE POLICY "Authenticated users can insert logs" ON public.system_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
