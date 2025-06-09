-- Drop existing function if it exists
DROP FUNCTION IF EXISTS find_nearby_spots_simple(double precision, double precision, integer, integer);

-- First, let's check what the actual column types are
DO $$
DECLARE
    lat_type text;
    lng_type text;
BEGIN
    SELECT data_type INTO lat_type 
    FROM information_schema.columns 
    WHERE table_name = 'parking_spots' AND column_name = 'latitude';
    
    SELECT data_type INTO lng_type 
    FROM information_schema.columns 
    WHERE table_name = 'parking_spots' AND column_name = 'longitude';
    
    RAISE NOTICE 'Latitude type: %, Longitude type: %', lat_type, lng_type;
END $$;

-- Create function with correct return types matching the actual table structure
CREATE OR REPLACE FUNCTION find_nearby_spots_simple(
    user_lat double precision,
    user_lng double precision,
    radius_meters integer DEFAULT 1000,
    max_results integer DEFAULT 50
)
RETURNS TABLE (
    id text,
    latitude numeric,  -- Changed from double precision to numeric
    longitude numeric, -- Changed from double precision to numeric
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
AS $$
BEGIN
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
                cos(radians(user_lat)) * 
                cos(radians(ps.latitude::double precision)) * 
                cos(radians(ps.longitude::double precision) - radians(user_lng)) + 
                sin(radians(user_lat)) * 
                sin(radians(ps.latitude::double precision))
            )
        )::double precision as distance_meters
    FROM parking_spots ps
    WHERE 
        ps.is_available = true
        AND (ps.expires_at IS NULL OR ps.expires_at > NOW())
        AND (
            6371000 * acos(
                cos(radians(user_lat)) * 
                cos(radians(ps.latitude::double precision)) * 
                cos(radians(ps.longitude::double precision) - radians(user_lng)) + 
                sin(radians(user_lat)) * 
                sin(radians(ps.latitude::double precision))
            )
        ) <= radius_meters
    ORDER BY distance_meters ASC
    LIMIT max_results;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION find_nearby_spots_simple TO anon, authenticated;

-- Test the function with a simple query first
SELECT 'Testing function...' as status;

-- Test with London coordinates
SELECT 
    id, 
    latitude, 
    longitude, 
    address, 
    spot_type,
    distance_meters
FROM find_nearby_spots_simple(51.5074, -0.1278, 5000, 5);
