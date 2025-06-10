-- First, let's check the actual column types in parking_spots table
DO $$
DECLARE
    lat_type text;
    lng_type text;
BEGIN
    -- Get the actual data types of latitude and longitude columns
    SELECT data_type INTO lat_type 
    FROM information_schema.columns 
    WHERE table_name = 'parking_spots' AND column_name = 'latitude';
    
    SELECT data_type INTO lng_type 
    FROM information_schema.columns 
    WHERE table_name = 'parking_spots' AND column_name = 'longitude';
    
    RAISE NOTICE 'Latitude column type: %', lat_type;
    RAISE NOTICE 'Longitude column type: %', lng_type;
END $$;

-- Drop the problematic function first
DROP FUNCTION IF EXISTS find_nearby_spots_simple(DECIMAL, DECIMAL, INTEGER);

-- Create a new function with correct return types matching your table structure
CREATE OR REPLACE FUNCTION find_nearby_spots_simple(
    user_lat DOUBLE PRECISION,
    user_lng DOUBLE PRECISION,
    radius_meters INTEGER DEFAULT 500
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
        ps.id::TEXT,
        ps.latitude::DOUBLE PRECISION,
        ps.longitude::DOUBLE PRECISION,
        COALESCE(ps.address, 'Unknown Address') as address,
        COALESCE(ps.spot_type, 'street') as spot_type,
        COALESCE(ps.is_available, true) as is_available,
        ST_Distance(
            ST_SetSRID(ST_MakePoint(ps.longitude::DOUBLE PRECISION, ps.latitude::DOUBLE PRECISION), 4326)::geography,
            ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
        ) as distance_meters
    FROM parking_spots ps
    WHERE 
        ps.latitude IS NOT NULL 
        AND ps.longitude IS NOT NULL
        AND ST_DWithin(
            ST_SetSRID(ST_MakePoint(ps.longitude::DOUBLE PRECISION, ps.latitude::DOUBLE PRECISION), 4326)::geography,
            ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
            radius_meters
        )
    ORDER BY distance_meters ASC
    LIMIT 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION find_nearby_spots_simple(DOUBLE PRECISION, DOUBLE PRECISION, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION find_nearby_spots_simple(DOUBLE PRECISION, DOUBLE PRECISION, INTEGER) TO anon;

-- Alternative: Create an even simpler function that just returns basic data
CREATE OR REPLACE FUNCTION get_parking_spots_basic()
RETURNS TABLE (
    id TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    address TEXT,
    spot_type TEXT,
    is_available BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ps.id::TEXT,
        ps.latitude::DOUBLE PRECISION,
        ps.longitude::DOUBLE PRECISION,
        COALESCE(ps.address, 'Unknown Address') as address,
        COALESCE(ps.spot_type, 'street') as spot_type,
        COALESCE(ps.is_available, true) as is_available
    FROM parking_spots ps
    WHERE 
        ps.latitude IS NOT NULL 
        AND ps.longitude IS NOT NULL
    LIMIT 100;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions for basic function
GRANT EXECUTE ON FUNCTION get_parking_spots_basic() TO authenticated;
GRANT EXECUTE ON FUNCTION get_parking_spots_basic() TO anon;

-- Test both functions
SELECT 'Testing basic function:' as test;
SELECT * FROM get_parking_spots_basic() LIMIT 3;

SELECT 'Testing nearby function with SF coordinates:' as test;
SELECT * FROM find_nearby_spots_simple(37.7749, -122.4194, 5000) LIMIT 3;
