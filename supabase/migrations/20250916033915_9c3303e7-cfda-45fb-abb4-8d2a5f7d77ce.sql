-- Database Schema for PotholeTracker
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create potholes table
CREATE TABLE IF NOT EXISTS public.potholes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    severity VARCHAR(10) NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    vehicle_id TEXT NOT NULL,
    status VARCHAR(15) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'repaired')),
    reported_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vehicles table
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    vehicle_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_ping TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    pothole_id UUID REFERENCES public.potholes(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    type VARCHAR(15) NOT NULL CHECK (type IN ('detection', 'repair', 'alert')),
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles table for user data
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    display_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'operator',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_potholes_location ON public.potholes(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_potholes_severity ON public.potholes(severity);
CREATE INDEX IF NOT EXISTS idx_potholes_status ON public.potholes(status);
CREATE INDEX IF NOT EXISTS idx_potholes_created_at ON public.potholes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vehicles_active ON public.vehicles(is_active);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for potholes table
CREATE TRIGGER update_potholes_updated_at 
    BEFORE UPDATE ON public.potholes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for profiles table
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to create notification when pothole is created
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
$$ language 'plpgsql';

-- Create trigger to auto-create notifications
CREATE TRIGGER pothole_notification_trigger
    AFTER INSERT ON public.potholes
    FOR EACH ROW
    EXECUTE FUNCTION create_pothole_notification();

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'display_name');
  RETURN NEW;
END;
$$;

-- Trigger to auto-create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Row Level Security
ALTER TABLE public.potholes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Allow all operations on potholes for authenticated users" ON public.potholes FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow all operations on vehicles for authenticated users" ON public.vehicles FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow all operations on notifications for authenticated users" ON public.notifications FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Insert sample vehicles
INSERT INTO public.vehicles (vehicle_id, name) VALUES 
('DASHCAM-001', 'City Patrol Vehicle 1'),
('DASHCAM-002', 'City Patrol Vehicle 2'),
('DASHCAM-003', 'Maintenance Truck 1')
ON CONFLICT (vehicle_id) DO NOTHING;

-- Insert sample potholes for testing
INSERT INTO public.potholes (latitude, longitude, severity, title, description, vehicle_id, reported_at) VALUES 
(28.6129, 77.2295, 'high', 'Large pothole on main road', 'Deep pothole causing vehicle damage', 'DASHCAM-001', NOW() - INTERVAL '1 day'),
(28.6139, 77.2085, 'medium', 'Medium pothole detected', 'Moderate depth pothole on side street', 'DASHCAM-002', NOW() - INTERVAL '2 hours'),
(28.6149, 77.2195, 'low', 'Small pothole on residential street', 'Minor surface damage detected', 'DASHCAM-003', NOW() - INTERVAL '30 minutes')
ON CONFLICT DO NOTHING;