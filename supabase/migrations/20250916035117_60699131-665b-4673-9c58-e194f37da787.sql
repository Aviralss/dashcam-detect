-- Fix security vulnerability: Implement role-based access control for vehicles table

-- 1. Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'operator', 'user');

-- 2. Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (user_id, role)
);

-- 3. Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
        AND role = _role
    )
$$;

-- 5. Create function to check if user is admin or operator
CREATE OR REPLACE FUNCTION public.is_admin_or_operator(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
        AND role IN ('admin', 'operator')
    )
$$;

-- 6. Drop existing overly permissive policy
DROP POLICY IF EXISTS "Allow all operations on vehicles for authenticated users" ON public.vehicles;

-- 7. Create new restrictive policies for vehicles table
-- Allow all users to read vehicles (for dashboard display)
CREATE POLICY "Anyone can view vehicles"
ON public.vehicles
FOR SELECT
TO authenticated
USING (true);

-- Only admins and operators can create vehicles
CREATE POLICY "Admins and operators can create vehicles"
ON public.vehicles
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_or_operator(auth.uid()));

-- Only admins and operators can update vehicles
CREATE POLICY "Admins and operators can update vehicles"
ON public.vehicles
FOR UPDATE
TO authenticated
USING (public.is_admin_or_operator(auth.uid()));

-- Only admins can delete vehicles
CREATE POLICY "Admins can delete vehicles"
ON public.vehicles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 8. Create RLS policies for user_roles table
-- Users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Only admins can manage roles
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 9. Insert default admin role for first user (you'll need to set this up manually)
-- This is commented out - you should manually assign admin role to your first user