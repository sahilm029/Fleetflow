-- FleetFlow Database Schema
-- This migration creates all core tables and RLS policies for the fleet management system

-- ============================================================================
-- 1. PROFILES TABLE - User roles and metadata
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'driver')),
  company_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Admin and managers can see all profiles; drivers can see only their own
CREATE POLICY "profiles_select_own_or_admin" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id 
    OR (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'manager')
  );

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own_or_admin" ON public.profiles
  FOR UPDATE USING (
    auth.uid() = id 
    OR (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'manager')
  );

-- ============================================================================
-- 2. VEHICLES TABLE - Fleet vehicle information
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vin TEXT UNIQUE NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  license_plate TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'in_use', 'maintenance', 'retired')),
  current_odometer DECIMAL(10, 2),
  fuel_capacity DECIMAL(8, 2),
  company_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- Drivers can see only their assigned vehicles; admins/managers see all
CREATE POLICY "vehicles_select_assigned_or_admin" ON public.vehicles
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'manager')
  );

CREATE POLICY "vehicles_insert_admin_manager" ON public.vehicles
  FOR INSERT WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'manager')
  );

CREATE POLICY "vehicles_update_admin_manager" ON public.vehicles
  FOR UPDATE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'manager')
  );

CREATE POLICY "vehicles_delete_admin_manager" ON public.vehicles
  FOR DELETE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'manager')
  );

CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_vehicles_company ON vehicles(company_id);

-- ============================================================================
-- 3. DRIVERS TABLE - Driver information
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  license_number TEXT UNIQUE NOT NULL,
  license_expiry DATE,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave')),
  experience_years INTEGER,
  company_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

-- Drivers can see their own info; admins/managers see all
CREATE POLICY "drivers_select_own_or_admin" ON public.drivers
  FOR SELECT USING (
    user_id = auth.uid() 
    OR (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'manager')
  );

CREATE POLICY "drivers_insert_admin_manager" ON public.drivers
  FOR INSERT WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'manager')
  );

CREATE POLICY "drivers_update_admin_manager" ON public.drivers
  FOR UPDATE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'manager')
  );

CREATE INDEX idx_drivers_user ON drivers(user_id);
CREATE INDEX idx_drivers_status ON drivers(status);

-- ============================================================================
-- 4. ASSIGNMENTS TABLE - Vehicle to Driver assignments
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  assigned_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  unassigned_date TIMESTAMP WITH TIME ZONE,
  company_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- Drivers can see their assignments; admins/managers see all
CREATE POLICY "assignments_select_own_or_admin" ON public.assignments
  FOR SELECT USING (
    driver_id = auth.uid() 
    OR (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'manager')
  );

CREATE POLICY "assignments_insert_admin_manager" ON public.assignments
  FOR INSERT WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'manager')
  );

CREATE POLICY "assignments_update_admin_manager" ON public.assignments
  FOR UPDATE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'manager')
  );

CREATE INDEX idx_assignments_driver ON assignments(driver_id);
CREATE INDEX idx_assignments_vehicle ON assignments(vehicle_id);
CREATE INDEX idx_assignments_active ON assignments(is_active);

-- ============================================================================
-- 5. ROUTES TABLE - Route definitions
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  start_location TEXT NOT NULL,
  end_location TEXT NOT NULL,
  distance_km DECIMAL(8, 2),
  estimated_time_hours DECIMAL(4, 2),
  company_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view routes
CREATE POLICY "routes_select_all" ON public.routes
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "routes_insert_admin_manager" ON public.routes
  FOR INSERT WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'manager')
  );

CREATE POLICY "routes_update_admin_manager" ON public.routes
  FOR UPDATE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'manager')
  );

CREATE POLICY "routes_delete_admin_manager" ON public.routes
  FOR DELETE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'manager')
  );

CREATE INDEX idx_routes_company ON routes(company_id);

-- ============================================================================
-- 6. TRIP HISTORY TABLE - Completed trips with tracking data
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.trip_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  route_id UUID REFERENCES routes(id) ON DELETE SET NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  distance_km DECIMAL(8, 2),
  duration_hours DECIMAL(5, 2),
  fuel_used DECIMAL(8, 2),
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'cancelled')),
  notes TEXT,
  company_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.trip_history ENABLE ROW LEVEL SECURITY;

-- Drivers see their trips; admins/managers see all
CREATE POLICY "trip_history_select_own_or_admin" ON public.trip_history
  FOR SELECT USING (
    driver_id = auth.uid() 
    OR (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'manager')
  );

CREATE POLICY "trip_history_insert_own_or_admin" ON public.trip_history
  FOR INSERT WITH CHECK (
    driver_id = auth.uid() 
    OR (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'manager')
  );

CREATE POLICY "trip_history_update_admin_manager" ON public.trip_history
  FOR UPDATE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'manager')
  );

CREATE INDEX idx_trip_vehicle ON trip_history(vehicle_id);
CREATE INDEX idx_trip_driver ON trip_history(driver_id);
CREATE INDEX idx_trip_date ON trip_history(start_time);
CREATE INDEX idx_trip_status ON trip_history(status);

-- ============================================================================
-- 7. VEHICLE STATUS TABLE - Real-time vehicle locations and status
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.vehicle_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL UNIQUE REFERENCES vehicles(id) ON DELETE CASCADE,
  current_latitude DECIMAL(9, 6),
  current_longitude DECIMAL(9, 6),
  is_online BOOLEAN DEFAULT false,
  last_update TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  company_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.vehicle_status ENABLE ROW LEVEL SECURITY;

-- Drivers see their assigned vehicles; admins/managers see all
CREATE POLICY "vehicle_status_select_assigned_or_admin" ON public.vehicle_status
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'manager')
  );

CREATE POLICY "vehicle_status_update_driver_or_admin" ON public.vehicle_status
  FOR UPDATE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'manager')
  );

CREATE INDEX idx_vehicle_status_online ON vehicle_status(is_online);

-- ============================================================================
-- 8. MAINTENANCE SCHEDULES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.maintenance_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  interval_months INTEGER,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
  estimated_cost DECIMAL(10, 2),
  notes TEXT,
  company_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.maintenance_schedules ENABLE ROW LEVEL SECURITY;

-- Admins/managers can manage; drivers can view their vehicle schedules
CREATE POLICY "maintenance_schedules_select_all" ON public.maintenance_schedules
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'manager', 'driver')
  );

CREATE POLICY "maintenance_schedules_insert_admin_manager" ON public.maintenance_schedules
  FOR INSERT WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'manager')
  );

CREATE POLICY "maintenance_schedules_update_admin_manager" ON public.maintenance_schedules
  FOR UPDATE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'manager')
  );

CREATE POLICY "maintenance_schedules_delete_admin_manager" ON public.maintenance_schedules
  FOR DELETE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'manager')
  );

CREATE INDEX idx_maintenance_schedules_vehicle ON maintenance_schedules(vehicle_id);
CREATE INDEX idx_maintenance_schedules_date ON maintenance_schedules(scheduled_date);

-- ============================================================================
-- 9. MAINTENANCE LOGS TABLE - Completed maintenance records
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.maintenance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES maintenance_schedules(id) ON DELETE SET NULL,
  service_type TEXT NOT NULL,
  completion_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  service_provider TEXT,
  cost DECIMAL(10, 2),
  odometer_reading DECIMAL(10, 2),
  notes TEXT,
  company_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.maintenance_logs ENABLE ROW LEVEL SECURITY;

-- Admins/managers can manage; all users can view
CREATE POLICY "maintenance_logs_select_all" ON public.maintenance_logs
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "maintenance_logs_insert_admin_manager" ON public.maintenance_logs
  FOR INSERT WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'manager')
  );

CREATE POLICY "maintenance_logs_update_admin_manager" ON public.maintenance_logs
  FOR UPDATE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'manager')
  );

CREATE INDEX idx_maintenance_logs_vehicle ON maintenance_logs(vehicle_id);
CREATE INDEX idx_maintenance_logs_date ON maintenance_logs(completion_date);

-- ============================================================================
-- 10. FUEL LOGS TABLE - Fuel consumption tracking
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.fuel_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  trip_id UUID REFERENCES trip_history(id) ON DELETE SET NULL,
  fuel_amount DECIMAL(8, 2) NOT NULL,
  fuel_cost DECIMAL(10, 2),
  odometer_reading DECIMAL(10, 2),
  refuel_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  location TEXT,
  company_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.fuel_logs ENABLE ROW LEVEL SECURITY;

-- Drivers see their fuel logs; admins/managers see all
CREATE POLICY "fuel_logs_select_own_or_admin" ON public.fuel_logs
  FOR SELECT USING (
    driver_id = auth.uid() 
    OR (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'manager')
  );

CREATE POLICY "fuel_logs_insert_own_or_admin" ON public.fuel_logs
  FOR INSERT WITH CHECK (
    driver_id = auth.uid() 
    OR (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'manager')
  );

CREATE POLICY "fuel_logs_update_admin_manager" ON public.fuel_logs
  FOR UPDATE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'manager')
  );

CREATE INDEX idx_fuel_logs_vehicle ON fuel_logs(vehicle_id);
CREATE INDEX idx_fuel_logs_driver ON fuel_logs(driver_id);
CREATE INDEX idx_fuel_logs_date ON fuel_logs(refuel_date);

-- ============================================================================
-- 11. COMPANY SETTINGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id TEXT UNIQUE NOT NULL,
  company_name TEXT NOT NULL,
  country TEXT,
  timezone TEXT DEFAULT 'UTC',
  currency TEXT DEFAULT 'USD',
  alert_low_fuel_percentage INTEGER DEFAULT 20,
  alert_maintenance_days INTEGER DEFAULT 7,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

-- Admins only
CREATE POLICY "company_settings_select_admin" ON public.company_settings
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "company_settings_update_admin" ON public.company_settings
  FOR UPDATE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- ============================================================================
-- 12. TRIGGER - Auto-create profile on signup
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, first_name, last_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'role', 'driver'),
    COALESCE(new.raw_user_meta_data ->> 'first_name', NULL),
    COALESCE(new.raw_user_meta_data ->> 'last_name', NULL)
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 13. TRIGGER - Auto-create vehicle status
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_vehicle()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.vehicle_status (vehicle_id, is_online, company_id)
  VALUES (new.id, false, new.company_id)
  ON CONFLICT (vehicle_id) DO NOTHING;

  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_vehicle_created ON vehicles;

CREATE TRIGGER on_vehicle_created
  AFTER INSERT ON vehicles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_vehicle();
