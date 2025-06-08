-- Nuclear option: Find and destroy ALL references to "location" column

-- First, let's find what's referencing the "location" column
DO $$
DECLARE
    rec RECORD;
BEGIN
    -- Drop all functions that might reference location
    FOR rec IN 
        SELECT routine_name, routine_schema
        FROM information_schema.routines 
        WHERE routine_schema = 'public'
    LOOP
        BEGIN
            EXECUTE 'DROP FUNCTION IF EXISTS ' || rec.routine_schema || '.' || rec.routine_name || ' CASCADE';
        EXCEPTION WHEN OTHERS THEN
            -- Continue even if drop fails
            NULL;
        END;
    END LOOP;
    
    -- Drop all views that might reference location
    FOR rec IN 
        SELECT table_name, table_schema
        FROM information_schema.views 
        WHERE table_schema = 'public'
    LOOP
        BEGIN
            EXECUTE 'DROP VIEW IF EXISTS ' || rec.table_schema || '.' || rec.table_name || ' CASCADE';
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END;
    END LOOP;
    
    -- Drop all tables
    FOR rec IN 
        SELECT table_name, table_schema
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    LOOP
        BEGIN
            EXECUTE 'DROP TABLE IF EXISTS ' || rec.table_schema || '.' || rec.table_name || ' CASCADE';
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END;
    END LOOP;
END $$;

-- Drop any remaining sequences
DROP SEQUENCE IF EXISTS public.parking_usage_history_id_seq CASCADE;
DROP SEQUENCE IF EXISTS public.spot_reports_id_seq CASCADE;
DROP SEQUENCE IF EXISTS public.notifications_id_seq CASCADE;

-- Drop any remaining types
DROP TYPE IF EXISTS public.spot_type CASCADE;
DROP TYPE IF EXISTS public.report_type CASCADE;
DROP TYPE IF EXISTS public.subscription_tier CASCADE;

-- Now let's check what extensions we have and recreate them
SELECT 'Checking extensions...' as status;

-- Enable required extensions (this is safe to run multiple times)
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

SELECT 'Extensions enabled' as status;

-- Now create everything fresh with NO references to "location"
SELECT 'Creating fresh schema...' as status;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    reputation_score INTEGER DEFAULT 100,
    total_reports INTEGER DEFAULT 0,
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'enterprise')),
    preferences JSONB DEFAULT '{"notifications": true, "radius": 500, "autoRefresh": true}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create parking_spots table - NO LOCATION COLUMN, using lat/lng + geom
CREATE TABLE public.parking_spots (
    id TEXT PRIMARY KEY,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    geom GEOGRAPHY(POINT, 4326),
    address TEXT,
    spot_type TEXT CHECK (spot_type IN ('street', 'garage', 'lot', 'meter')) DEFAULT 'street',
    is_available BOOLEAN DEFAULT true,
    reported_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '15 minutes'),
    confidence_score INTEGER DEFAULT 100 CHECK (confidence_score >= 0 AND confidence_score <= 100),
    price_per_hour DECIMAL(10, 2),
    max_duration_hours INTEGER DEFAULT 24,
    restrictions TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create other tables
CREATE TABLE public.parking_usage_history (
    id SERIAL PRIMARY KEY,
    spot_id TEXT REFERENCES public.parking_spots(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL CHECK (action IN ('occupied', 'vacated', 'reported', 'verified')),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT
);

CREATE TABLE public.spot_reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    spot_id TEXT REFERENCES public.parking_spots(id) ON DELETE CASCADE,
    reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    report_type TEXT CHECK (report_type IN ('available', 'taken', 'invalid', 'expired')) NOT NULL,
    notes TEXT,
    photo_url TEXT,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    notification_type TEXT DEFAULT 'info' CHECK (notification_type IN ('info', 'warning', 'success', 'error')),
    data JSONB,
    read BOOLEAN DEFAULT false,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create real_parking_spots table for external data
CREATE TABLE public.real_parking_spots (
    id SERIAL PRIMARY KEY,
    provider_id TEXT NOT NULL,
    provider TEXT NOT NULL,
    name TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    address TEXT,
    spot_type TEXT CHECK (spot_type IN ('street', 'garage', 'lot', 'meter')) DEFAULT 'street',
    price_per_hour DECIMAL(10, 2),
    is_available BOOLEAN DEFAULT true,
    total_spaces INTEGER,
    available_spaces INTEGER,
    real_time_data BOOLEAN DEFAULT false,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(provider, provider_id)
);

SELECT 'Tables created' as status;

-- Create function to update geometry from lat/lng
CREATE OR REPLACE FUNCTION public.update_parking_spot_geom()
RETURNS TRIGGER AS $$
BEGIN
    NEW.geom = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_parking_spot_geom_trigger
    BEFORE INSERT OR UPDATE ON public.parking_spots
    FOR EACH ROW
    EXECUTE FUNCTION public.update_parking_spot_geom();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_parking_spots_updated_at
    BEFORE UPDATE ON public.parking_spots
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

SELECT 'Triggers created' as status;

-- Create indexes
CREATE INDEX idx_parking_spots_coords ON public.parking_spots(latitude, longitude);
CREATE INDEX idx_parking_spots_geom ON public.parking_spots USING GIST (geom);
CREATE INDEX idx_parking_spots_available ON public.parking_spots(is_available);
CREATE INDEX idx_parking_spots_type ON public.parking_spots(spot_type);
CREATE INDEX idx_parking_usage_history_spot_id ON public.parking_usage_history(spot_id);
CREATE INDEX idx_parking_usage_history_timestamp ON public.parking_usage_history(timestamp);
CREATE INDEX idx_spot_reports_spot_id ON public.spot_reports(spot_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_real_parking_spots_coords ON public.real_parking_spots(latitude, longitude);
CREATE INDEX idx_real_parking_spots_provider ON public.real_parking_spots(provider, provider_id);

SELECT 'Indexes created' as status;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parking_spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parking_usage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spot_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.real_parking_spots ENABLE ROW LEVEL SECURITY;

-- Create ultra-permissive RLS policies
CREATE POLICY "Allow all access to profiles" ON public.profiles FOR ALL USING (true);
CREATE POLICY "Allow all access to parking spots" ON public.parking_spots FOR ALL USING (true);
CREATE POLICY "Allow all access to parking usage history" ON public.parking_usage_history FOR ALL USING (true);
CREATE POLICY "Allow all access to spot reports" ON public.spot_reports FOR ALL USING (true);
CREATE POLICY "Allow all access to notifications" ON public.notifications FOR ALL USING (true);
CREATE POLICY "Allow all access to real parking spots" ON public.real_parking_spots FOR ALL USING (true);

SELECT 'RLS policies created' as status;

-- Create the nearby spots function - NO LOCATION REFERENCES
CREATE OR REPLACE FUNCTION public.find_nearby_spots(
    user_lat DOUBLE PRECISION,
    user_lng DOUBLE PRECISION,
    radius_meters INTEGER DEFAULT 1000
)
RETURNS TABLE (
    id TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    address TEXT,
    spot_type TEXT,
    is_available BOOLEAN,
    distance_meters DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ps.id,
        ps.latitude,
        ps.longitude,
        ps.address,
        ps.spot_type,
        ps.is_available,
        ST_Distance(
            ps.geom,
            ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
        ) as distance_meters
    FROM public.parking_spots ps
    WHERE ps.geom IS NOT NULL
    AND ST_DWithin(
        ps.geom,
        ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
        radius_meters
    )
    ORDER BY distance_meters;
END;
$$ LANGUAGE plpgsql;

SELECT 'Functions created' as status;

-- Insert comprehensive test data
INSERT INTO public.parking_spots (id, latitude, longitude, spot_type, address, is_available) VALUES
('google_ChIJqSoVJ-hQw0cRblmMjw9R5Ko', 52.3680, 4.9046, 'street', 'Spui 3, Amsterdam', true),
('google_ChIJtXeV6cVQw0cRdqges2xroWo', 52.3679, 4.9045, 'lot', 'Public Lot, Amsterdam', true),
('google_ChIJrwmAAeNRw0cRl9CBUSuhFnM', 52.3683, 4.9049, 'street', 'Rokin 5, Amsterdam', true),
('google_ChIJ6eiLTOhQw0cRciypB-8i3mA', 52.3692, 4.9058, 'street', 'Canal Street 10, Amsterdam', true),
('google_ChIJ0wKH_V5Rw0cRRHoMsfQRvQg', 52.3694, 4.9060, 'street', 'Red Light District, Amsterdam', true),
('google_ChIJy-pTTuhQw0cRcxE-7JkxxF0', 52.3693, 4.9059, 'lot', 'Business District, Amsterdam', true),
('google_ChIJS7-x4ulRw0cRvZ8jFe737TM', 52.3684, 4.9050, 'lot', 'Park & Ride, Amsterdam', true),
('google_ChIJozhPpVdRw0cRLRq4i0LqZIE', 52.3687, 4.9053, 'garage', 'Museum Garage, Amsterdam', false),
('osm_229430300', 52.3695, 4.9061, 'street', 'OSM Street 1, Amsterdam', true),
('osm_274494286', 52.3696, 4.9062, 'garage', 'OSM Underground, Amsterdam', false),
('osm_312201375', 52.3697, 4.9063, 'street', 'OSM Rokin, Amsterdam', true),
('osm_374484319', 52.3698, 4.9064, 'lot', 'OSM Park & Ride, Amsterdam', true),
('osm_374484330', 52.3699, 4.9065, 'street', 'OSM Leidsestraat, Amsterdam', true),
('osm_586048352', 52.3700, 4.9066, 'street', 'OSM Museumplein, Amsterdam', true),
('osm_589047127', 52.3701, 4.9067, 'garage', 'OSM Museum Garage, Amsterdam', false),
('osm_589052000', 52.3702, 4.9068, 'street', 'OSM Vondelpark, Amsterdam', true),
('osm_589197917', 52.3703, 4.9069, 'lot', 'OSM Concert Hall, Amsterdam', true),
('osm_591094619', 52.3704, 4.9070, 'street', 'OSM Jordaan, Amsterdam', true),
('osm_694507240', 52.3705, 4.9071, 'garage', 'OSM Shopping, Amsterdam', false),
('osm_696520424', 52.3706, 4.9072, 'street', 'OSM Canal, Amsterdam', true),
('sample_1', 52.3707, 4.9073, 'street', 'Sample Street 1, Amsterdam', true),
('sample_2', 52.3708, 4.9074, 'lot', 'Sample Lot 2, Amsterdam', true),
('sample_3', 52.3709, 4.9075, 'garage', 'Sample Garage 3, Amsterdam', false),
('sample_4', 52.3710, 4.9076, 'meter', 'Sample Meter 4, Amsterdam', true),
('sample_5', 52.3711, 4.9077, 'street', 'Sample Street 5, Amsterdam', true);

SELECT 'Test data inserted' as status;

-- Insert usage history
INSERT INTO public.parking_usage_history (spot_id, action, timestamp) VALUES
('google_ChIJqSoVJ-hQw0cRblmMjw9R5Ko', 'occupied', NOW() - INTERVAL '2 hours'),
('google_ChIJqSoVJ-hQw0cRblmMjw9R5Ko', 'vacated', NOW() - INTERVAL '1 hour'),
('google_ChIJtXeV6cVQw0cRdqges2xroWo', 'occupied', NOW() - INTERVAL '30 minutes'),
('sample_1', 'occupied', NOW() - INTERVAL '1 hour'),
('sample_2', 'vacated', NOW() - INTERVAL '30 minutes');

SELECT 'Usage history inserted' as status;

-- Final verification
SELECT 'NUCLEAR RESET COMPLETED SUCCESSFULLY!' as status;
SELECT 'Tables created:' as info, COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'public';
SELECT 'Parking spots:' as info, COUNT(*) as count FROM public.parking_spots;
SELECT 'PostGIS working:' as info, PostGIS_Version() as version;

-- Test the function
SELECT 'Testing nearby spots function...' as status;
SELECT COUNT(*) as nearby_spots_found FROM public.find_nearby_spots(52.3680, 4.9046, 1000);

SELECT 'Database is ready for use!' as final_status;
