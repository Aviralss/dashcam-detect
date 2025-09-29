-- Create potholes table
CREATE TABLE public.potholes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  vehicle_id UUID,
  status TEXT NOT NULL DEFAULT 'detected' CHECK (status IN ('detected', 'verified', 'repaired')),
  reported_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vehicles table
CREATE TABLE public.vehicles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  last_ping TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pothole_id UUID REFERENCES public.potholes(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'pothole_detected' CHECK (type IN ('pothole_detected', 'pothole_verified', 'pothole_repaired', 'system_alert')),
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_potholes_location ON public.potholes (latitude, longitude);
CREATE INDEX idx_potholes_severity ON public.potholes (severity);
CREATE INDEX idx_potholes_status ON public.potholes (status);
CREATE INDEX idx_potholes_created_at ON public.potholes (created_at);
CREATE INDEX idx_notifications_pothole_id ON public.notifications (pothole_id);
CREATE INDEX idx_notifications_read ON public.notifications (read);
CREATE INDEX idx_vehicles_is_active ON public.vehicles (is_active);

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create function to create notifications for new potholes
CREATE OR REPLACE FUNCTION public.create_pothole_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (pothole_id, message, type)
  VALUES (
    NEW.id,
    'New pothole detected: ' || NEW.title || ' (Severity: ' || NEW.severity || ')',
    'pothole_detected'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers
CREATE TRIGGER update_potholes_updated_at
  BEFORE UPDATE ON public.potholes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER create_pothole_notification_trigger
  AFTER INSERT ON public.potholes
  FOR EACH ROW
  EXECUTE FUNCTION public.create_pothole_notification();

-- Enable Row Level Security
ALTER TABLE public.potholes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies (allowing all operations for now - you can restrict these later)
CREATE POLICY "Allow all operations on potholes" ON public.potholes FOR ALL USING (true);
CREATE POLICY "Allow all operations on vehicles" ON public.vehicles FOR ALL USING (true);
CREATE POLICY "Allow all operations on notifications" ON public.notifications FOR ALL USING (true);

-- Insert sample data
INSERT INTO public.vehicles (vehicle_id, name, is_active) VALUES
  ('DASH-001', 'Fleet Vehicle 1', true),
  ('DASH-002', 'Fleet Vehicle 2', true),
  ('DASH-003', 'Fleet Vehicle 3', false);

INSERT INTO public.potholes (latitude, longitude, severity, title, description, vehicle_id) VALUES
  (40.7128, -74.0060, 'medium', 'Pothole on Main St', 'Medium-sized pothole affecting traffic flow', (SELECT id FROM public.vehicles WHERE vehicle_id = 'DASH-001')),
  (40.7589, -73.9851, 'high', 'Large pothole near Central Park', 'Significant road damage requiring immediate attention', (SELECT id FROM public.vehicles WHERE vehicle_id = 'DASH-002')),
  (40.6892, -74.0445, 'low', 'Minor road imperfection', 'Small pothole, low priority repair', (SELECT id FROM public.vehicles WHERE vehicle_id = 'DASH-001'));