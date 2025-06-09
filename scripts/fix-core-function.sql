-- Drop all existing functions to start clean
DROP FUNCTION IF EXISTS find_nearby_spots_simple CASCADE;
DROP FUNCTION IF EXISTS get_nearby_spots_simple CASCADE;
DROP FUNCTION IF EXISTS get_available_parking_spots CASCADE;

-- Create a simple function that actually works
CREATE OR REPLACE FUNCTION get_nearby_spots_simple(
    user_lat double precision,
    user_lng double precision,
    radius_meters integer DEFAULT 1000,
    max_results integer DEFAULT 50
)
RETURNS TABLE (
    id text,
    latitude double precision,
    longitude double precision,
    address text,
    spot_type text,
    is_available boolean,
    price_per_hour double precision,
    provider text,
    distance_meters double precision
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ps.id::text,
        ps.latitude::double precision,
        ps.longitude::double precision,
        ps.address::text,
        ps.spot_type::text,
        ps.is_available,
        COALESCE(ps.price_per_hour::double precision, 0.0),
        COALESCE(ps.provider::text, 'unknown'),
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
    WHERE ps.is_available = true
    ORDER BY distance_meters ASC
    LIMIT max_results;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_nearby_spots_simple TO anon, authenticated;
