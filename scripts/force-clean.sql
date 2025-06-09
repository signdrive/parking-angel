-- Force drop ALL functions with find_nearby_spots name
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT proname, oidvectortypes(proargtypes) as argtypes 
              FROM pg_proc 
              WHERE proname = 'find_nearby_spots') 
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || r.proname || '(' || r.argtypes || ') CASCADE';
    END LOOP;
END $$;

-- Also drop any other parking-related functions
DROP FUNCTION IF EXISTS get_nearby_spots CASCADE;
DROP FUNCTION IF EXISTS find_parking_spots CASCADE;
DROP FUNCTION IF EXISTS get_parking_spots CASCADE;
DROP FUNCTION IF EXISTS nearby_spots CASCADE;

-- Drop and recreate table
DROP TABLE IF EXISTS parking_spots CASCADE;

-- Create simple table
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
    available_spaces INTEGER DEFAULT 5
);

-- Add sample data around NYC
INSERT INTO parking_spots (name, latitude, longitude, address, spot_type, is_available, price_per_hour, provider) VALUES
('Downtown Garage', 40.7128, -74.0060, '123 Main St', 'garage', true, 15.0, 'CityParking'),
('Street Zone A', 40.7130, -74.0058, '125 Main St', 'street', true, 5.0, 'ParkNow'),
('Public Lot', 40.7125, -74.0062, '121 Main St', 'lot', true, 8.0, 'SpotHero'),
('Free Parking', 40.7132, -74.0055, '127 Main St', 'street', true, 0.0, 'City'),
('Premium Spot', 40.7120, -74.0065, '119 Main St', 'garage', true, 20.0, 'Premium');

-- Create ONE simple function with unique name
CREATE OR REPLACE FUNCTION get_spots_nearby(
    user_lat double precision,
    user_lng double precision,
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
        p.provider,
        p.real_time_data,
        p.total_spaces,
        p.available_spaces,
        111320.0 * sqrt(power(p.latitude - user_lat, 2) + power(p.longitude - user_lng, 2)) as distance_meters
    FROM parking_spots p
    WHERE p.is_available = true
    ORDER BY distance_meters ASC
    LIMIT max_results;
$$;

-- Grant permissions
GRANT ALL ON TABLE parking_spots TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION get_spots_nearby TO authenticated, anon, service_role;

-- Test the function
SELECT 'Setup complete' as status;
SELECT name, distance_meters FROM get_spots_nearby(40.7128, -74.0060, 1000, 3);
