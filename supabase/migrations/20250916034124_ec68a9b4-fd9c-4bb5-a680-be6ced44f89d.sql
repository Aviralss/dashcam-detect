-- Fix security definer function search paths

-- Drop and recreate update_updated_at_column with proper search_path
DROP FUNCTION IF EXISTS update_updated_at_column();
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop and recreate create_pothole_notification with proper search_path  
DROP FUNCTION IF EXISTS create_pothole_notification();
CREATE OR REPLACE FUNCTION create_pothole_notification()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.notifications (pothole_id, message, type)
    VALUES (
        NEW.id,
        'New pothole detected: ' || NEW.title || ' (Severity: ' || NEW.severity || ')',
        'detection'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;