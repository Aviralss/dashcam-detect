-- Fix database function security by setting explicit search_path
-- Update the update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public;

-- Update the create_pothole_notification function (if it exists)
CREATE OR REPLACE FUNCTION public.create_pothole_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, pothole_id)
  VALUES (
    NEW.user_id,
    'pothole_detected',
    'New Pothole Detected',
    'A new pothole has been detected at ' || COALESCE(NEW.location, 'unknown location'),
    NEW.id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public;