-- Drop all existing functions with this name (regardless of parameters)
DROP FUNCTION IF EXISTS find_nearby_spots CASCADE;
DROP FUNCTION IF EXISTS find_nearby_spots(double precision, double precision) CASCADE;
DROP FUNCTION IF EXISTS find_nearby_spots(double precision, double precision, integer) CASCADE;
DROP FUNCTION IF EXISTS find_nearby_spots(double precision, double precision, integer, integer) CASCADE;
DROP FUNCTION IF EXISTS find_nearby_spots_simple CASCADE;
DROP FUNCTION IF EXISTS get_nearby_spots_basic CASCADE;
DROP FUNCTION IF EXISTS get_parking_spots_nearby CASCADE;
DROP FUNCTION IF EXISTS get_available_parking_spots CASCADE;

-- Drop and recreate the table to ensure clean state
DROP TABLE IF EXISTS parking_spots CASCADE;

-- Create the table with correct structure
CREATE TABLE parking_spots (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    address TEXT,
    spot_type TEXT DEFAULT 'street',
    is_available BOOLEAN DEFAULT true,
    price_per_hour DOUBLE PRECISION DEFAULT 0,
    provider TEXT DEFAULT 'local',
    real_time_data BOOLEAN DEFAULT false,
    total_spaces INTEGER DEFAULT 10,
    available_spaces INTEGER DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample data
INSERT INTO parking_spots (id, name, latitude, longitude, address, spot_type, is_available, price_per_hour, provider, total_spaces, available_spaces) VALUES
('spot-1', 'Downtown Parking Garage', 40.7128, -74.0060, '123 Main Street', 'garage', true, 15.0, 'CityParking', 50, 25),
('spot-2', 'Street Parking Zone A', 40.7130, -74.0058, '125 Main Street', 'street', true, 5.0, 'ParkNow', 20, 8),
('spot-3', 'Public Lot #1', 40.7125, -74.0062, '121 Main Street', 'lot', true, 8.0, 'SpotHero', 30, 12),
('spot-4', 'Free Street Parking', 40.7132, -74.0055, '127 Main Street', 'street', true, 0.0, 'City', 15, 7),
('spot-5', 'Premium Garage', 40.7120, -74.0065, '119 Main Street', 'garage', true, 20.0, 'PremiumPark', 100, 45),
('spot-6', 'Meter Parking', 40.7135, -74.0052, '129 Main Street', 'meter', true, 3.0, 'CityMeters', 10, 3),
('spot-7', 'Shopping Center Lot', 40.7118, -74.0068, '117 Main Street', 'lot', true, 0.0, 'ShoppingCenter', 200, 150),
('spot-8', 'Residential Street', 40.7138, -74.0050, '131 Main Street', 'street', true, 2.0, 'Residential', 25, 10),
('spot-9', 'Business District Garage', 40.7115, -74.0070, '115 Main Street', 'garage', true, 12.0, 'BusinessPark', 75, 30),
('spot-10', 'Park & Ride', 40.7140, -74.0048, '133 Main Street', 'lot', true, 5.0, 'Transit', 500, 200);

-- Create ONE simple function
CREATE OR REPLACE FUNCTION find_nearby_spots(
    lat double precision,
    lng double precision,
    radius_meters integer DEFAULT 5000,
    max_results integer DEFAULT 50
)
RETURNS TABLE (
    id text,
    name text,
    latitude double precision,
    longitude double precision,
    address text,
    spot_type text,
    is_available boolean,
    price_per_hour double precision,
    provider text,
    real_time_data boolean,
    total_spaces integer,
    available_spaces integer,
    distance_meters double precision
)
LANGUAGE sql
AS $$
    SELECT 
        p.id,
        p.name,
        p.latitude,
        p.longitude,
        p.address,
        p.spot_type,
        p.is_available,
        p.price_per_hour,
        p.real_time_data,
        p.total_spaces,
        p.available_spaces,
        -- Simple distance calculation
        (6371000 * acos(cos(radians(lat)) * cos(radians(p.latitude)) * cos(radians(p.longitude) - radians(lng)) + sin(radians(lat)) * sin(radians(p.latitude))))::double precision as distance_meters
    FROM parking_spots p
    WHERE p.is_available = true
    ORDER BY distance_meters ASC
    LIMIT max_results;
$$;

-- Grant permissions
GRANT ALL ON TABLE parking_spots TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION find_nearby_spots TO authenticated, anon, service_role;

-- Test it works
SELECT 'Function created successfully' as status;
SELECT id, name, latitude, longitude, distance_meters FROM find_nearby_spots(40.7128, -74.0060, 1000, 3);
