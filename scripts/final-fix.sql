-- First, let's see what tables exist and their structure
DO $$
BEGIN
    -- Drop the table if it exists to start fresh
    DROP TABLE IF EXISTS parking_spots CASCADE;
    
    -- Create the correct table structure
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
        total_spaces INTEGER,
        available_spaces INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Add some sample data
    INSERT INTO parking_spots (id, name, latitude, longitude, address, spot_type, is_available, price_per_hour, provider) VALUES
    ('spot-1', 'Downtown Parking Garage', 40.7128, -74.0060, '123 Main Street', 'garage', true, 15.0, 'CityParking'),
    ('spot-2', 'Street Parking Zone A', 40.7130, -74.0058, '125 Main Street', 'street', true, 5.0, 'ParkNow'),
    ('spot-3', 'Public Lot #1', 40.7125, -74.0062, '121 Main Street', 'lot', true, 8.0, 'SpotHero'),
    ('spot-4', 'Free Street Parking', 40.7132, -74.0055, '127 Main Street', 'street', true, 0.0, 'City'),
    ('spot-5', 'Premium Garage', 40.7120, -74.0065, '119 Main Street', 'garage', true, 20.0, 'PremiumPark'),
    ('spot-6', 'Meter Parking', 40.7135, -74.0052, '129 Main Street', 'meter', true, 3.0, 'CityMeters'),
    ('spot-7', 'Shopping Center Lot', 40.7118, -74.0068, '117 Main Street', 'lot', true, 0.0, 'ShoppingCenter'),
    ('spot-8', 'Residential Street', 40.7138, -74.0050, '131 Main Street', 'street', true, 2.0, 'Residential'),
    ('spot-9', 'Business District Garage', 40.7115, -74.0070, '115 Main Street', 'garage', true, 12.0, 'BusinessPark'),
    ('spot-10', 'Park & Ride', 40.7140, -74.0048, '133 Main Street', 'lot', true, 5.0, 'Transit');

END $$;

-- Create the function to find nearby spots
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
        p.provider,
        p.real_time_data,
        p.total_spaces,
        p.available_spaces,
        (6371000 * acos(cos(radians(lat)) * cos(radians(p.latitude)) * cos(radians(p.longitude) - radians(lng)) + sin(radians(lat)) * sin(radians(p.latitude)))) as distance_meters
    FROM parking_spots p
    WHERE p.is_available = true
    ORDER BY distance_meters ASC
    LIMIT max_results;
$$;

-- Grant permissions
GRANT ALL ON TABLE parking_spots TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION find_nearby_spots TO authenticated, anon, service_role;

-- Test the function
SELECT * FROM find_nearby_spots(40.7128, -74.0060, 1000, 5);
