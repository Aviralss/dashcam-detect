-- CRITICAL SECURITY FIX: Fix vehicle data exposure
-- Remove the overly permissive "Anyone can view vehicles" policy
DROP POLICY IF EXISTS "Anyone can view vehicles" ON public.vehicles;

-- Create a secure policy requiring authentication for viewing vehicles
CREATE POLICY "Authenticated users can view vehicles" ON public.vehicles
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);