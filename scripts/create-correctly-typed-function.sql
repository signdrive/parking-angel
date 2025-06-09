-- Drop existing functions
DROP FUNCTION IF EXISTS find_nearby_spots_simple(double precision, double precision, integer, integer);
DROP FUNCTION IF EXISTS get_nearby_spots_basic(double precision, double precision, integer, integer);

-- Create function with correct types matching the actual table
CREATE OR REPLACE FUNCTION get_parking_spots_nearby(
    user_lat double precision,
    user_lng double precision,
    radius_meters integer DEFAULT 1000,
    max_results integer DEFAULT 50
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
    payment_methods text[], -- This is an array type
    accessibility boolean,
    covered boolean,
    security boolean,
    ev_charging boolean,
    provider text,
    confidence_score integer,
    expires_at timestamptz,
    last_updated timestamptz
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
        ps.payment_methods, -- Keep as array
        ps.accessibility,
        ps.covered,
        ps.security,
        ps.ev_charging,
        ps.provider,
        ps.confidence_score,
        ps.expires_at,
        ps.last_updated
    FROM parking_spots ps
    WHERE 
        ps.is_available = true
        AND (ps.expires_at IS NULL OR ps.expires_at > NOW())
        -- Simple bounding box filter
        AND ps.latitude BETWEEN (user_lat - (radius_meters::double precision / 111000)) 
                            AND (user_lat + (radius_meters::double precision / 111000))
        AND ps.longitude BETWEEN (user_lng - (radius_meters::double precision / (111000 * cos(radians(user_lat))))) 
                             AND (user_lng + (radius_meters::double precision / (111000 * cos(radians(user_lat)))))
    ORDER BY 
        -- Simple distance approximation
        (abs(ps.latitude::double precision - user_lat) + abs(ps.longitude::double precision - user_lng))
    LIMIT max_results;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_parking_spots_nearby TO anon, authenticated;

-- Test the function
SELECT 'Testing new function...' as status;

-- Test with London coordinates
SELECT 
    id, 
    latitude, 
    longitude, 
    address, 
    spot_type,
    payment_methods,
    restrictions
FROM get_parking_spots_nearby(51.5074, -0.1278, 5000, 3);
