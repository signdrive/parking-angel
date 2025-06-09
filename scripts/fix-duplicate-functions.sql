-- Drop all existing versions of find_nearby_spots function
DROP FUNCTION IF EXISTS find_nearby_spots(double precision, double precision, integer, integer);
DROP FUNCTION IF EXISTS find_nearby_spots(double precision, double precision, integer);
DROP FUNCTION IF EXISTS find_nearby_spots(numeric, numeric, integer, integer);
DROP FUNCTION IF EXISTS find_nearby_spots(numeric, numeric, integer);
DROP FUNCTION IF EXISTS find_nearby_spots_simple(double precision, double precision, integer, integer);
DROP FUNCTION IF EXISTS find_nearby_spots_simple(double precision, double precision, integer);
DROP FUNCTION IF EXISTS find_nearby_spots_simple(numeric, numeric, integer, integer);
DROP FUNCTION IF EXISTS find_nearby_spots_simple(numeric, numeric, integer);

-- Check what column types we actually have
DO $$
DECLARE
    lat_type text;
    lng_type text;
    id_type text;
BEGIN
    SELECT data_type INTO lat_type 
    FROM information_schema.columns 
    WHERE table_name = 'parking_spots' AND column_name = 'latitude';
    
    SELECT data_type INTO lng_type 
    FROM information_schema.columns 
    WHERE table_name = 'parking_spots' AND column_name = 'longitude';
    
    SELECT data_type INTO id_type 
    FROM information_schema.columns 
    WHERE table_name = 'parking_spots' AND column_name = 'id';
    
    RAISE NOTICE 'Column types - Latitude: %, Longitude: %, ID: %', lat_type, lng_type, id_type;
END $$;

-- Create a single, clean function with explicit types
CREATE OR REPLACE FUNCTION find_nearby_spots(
    user_lat double precision,
    user_lng double precision,
    radius_meters integer DEFAULT 1000
)
RETURNS TABLE (
    id text,
    latitude numeric,
    longitude numeric,
    address text,
    spot_type text,
    is_available boolean,
    price_per_hour numeric,
    max_duration_hours integer,
    total_spaces integer,
    available_spaces integer,
    restrictions text,
    payment_methods text[],
    accessibility boolean,
    covered boolean,
    security boolean,
    ev_charging boolean,
    provider text,
    confidence_score integer,
    expires_at timestamptz,
    last_updated timestamptz,
    distance_meters double precision
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Validate input parameters
    IF user_lat IS NULL OR user_lng IS NULL THEN
        RAISE EXCEPTION 'Latitude and longitude cannot be null';
    END IF;
    
    IF user_lat < -90 OR user_lat > 90 THEN
        RAISE EXCEPTION 'Invalid latitude: must be between -90 and 90';
    END IF;
    
    IF user_lng < -180 OR user_lng > 180 THEN
        RAISE EXCEPTION 'Invalid longitude: must be between -180 and 180';
    END IF;
    
    IF radius_meters <= 0 OR radius_meters > 50000 THEN
        RAISE EXCEPTION 'Invalid radius: must be between 1 and 50000 meters';
    END IF;

    RETURN QUERY
    SELECT 
        ps.id,
        ps.latitude,
        ps.longitude,
        ps.address,
        ps.spot_type,
        ps.is_available,
        ps.price_per_hour,
        ps.max_duration_hours,
        ps.total_spaces,
        ps.available_spaces,
        ps.restrictions,
        ps.payment_methods,
        ps.accessibility,
        ps.covered,
        ps.security,
        ps.ev_charging,
        ps.provider,
        ps.confidence_score,
        ps.expires_at,
        ps.last_updated,
        -- Calculate distance using Haversine formula
        (
            6371000 * acos(
                LEAST(1.0, 
                    cos(radians(user_lat)) * 
                    cos(radians(ps.latitude::double precision)) * 
                    cos(radians(ps.longitude::double precision) - radians(user_lng)) + 
                    sin(radians(user_lat)) * 
                    sin(radians(ps.latitude::double precision))
                )
            )
        )::double precision as distance_meters
    FROM parking_spots ps
    WHERE 
        ps.is_available = true
        AND (ps.expires_at IS NULL OR ps.expires_at > NOW())
        AND (
            6371000 * acos(
                LEAST(1.0,
                    cos(radians(user_lat)) * 
                    cos(radians(ps.latitude::double precision)) * 
                    cos(radians(ps.longitude::double precision) - radians(user_lng)) + 
                    sin(radians(user_lat)) * 
                    sin(radians(ps.latitude::double precision))
                )
            )
        ) <= radius_meters
    ORDER BY distance_meters ASC
    LIMIT 50;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error in find_nearby_spots: %', SQLERRM;
        RETURN;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION find_nearby_spots(double precision, double precision, integer) TO anon, authenticated;

-- Test the function with explicit type casting
SELECT 'Testing function with explicit types...' as status;

-- Test with London coordinates using explicit casting
SELECT 
    id, 
    latitude, 
    longitude, 
    address, 
    spot_type,
    distance_meters
FROM find_nearby_spots(51.5074::double precision, -0.1278::double precision, 5000)
LIMIT 5;

-- Test with San Francisco coordinates
SELECT 
    id, 
    latitude, 
    longitude, 
    address, 
    spot_type,
    distance_meters
FROM find_nearby_spots(37.7749::double precision, -122.4194::double precision, 1000)
LIMIT 5;

SELECT 'Function cleanup and recreation completed successfully!' as result;
