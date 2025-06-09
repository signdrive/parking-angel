-- Create the parking_spots table if it doesn't exist
CREATE TABLE IF NOT EXISTS parking_spots (
    id TEXT PRIMARY KEY,
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

-- Add some sample data if the table is empty
INSERT INTO parking_spots (id, name, latitude, longitude, address, spot_type, is_available, price_per_hour, provider)
SELECT 
    'spot-' || i::text,
    'Parking Spot ' || i::text,
    40.7128 + (random() * 0.01 - 0.005),
    -74.0060 + (random() * 0.01 - 0.005),
    i || ' Main Street',
    CASE WHEN i % 3 = 0 THEN 'garage' WHEN i % 3 = 1 THEN 'street' ELSE 'lot' END,
    true,
    CASE WHEN i % 4 = 0 THEN 0 ELSE i % 10 END,
    CASE WHEN i % 5 = 0 THEN 'CityParking' WHEN i % 5 = 1 THEN 'ParkNow' ELSE 'SpotHero' END
FROM generate_series(1, 50) i
WHERE NOT EXISTS (SELECT 1 FROM parking_spots LIMIT 1);

-- Create a simple function to find nearby spots
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
        id,
        name,
        latitude,
        longitude,
        address,
        spot_type,
        is_available,
        price_per_hour,
        provider,
        real_time_data,
        total_spaces,
        available_spaces,
        (6371000 * acos(cos(radians(lat)) * cos(radians(latitude)) * cos(radians(longitude) - radians(lng)) + sin(radians(lat)) * sin(radians(latitude)))) as distance_meters
    FROM parking_spots
    WHERE is_available = true
    ORDER BY distance_meters ASC
    LIMIT max_results;
$$;

-- Grant permissions
GRANT ALL ON TABLE parking_spots TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION find_nearby_spots TO authenticated, anon, service_role;
