-- Create a simpler function without complex distance calculations
CREATE OR REPLACE FUNCTION get_nearby_spots_basic(
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
    payment_methods text[],
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
        ps.payment_methods,
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
        -- Simple bounding box filter (approximate)
        AND ps.latitude BETWEEN (user_lat - (radius_meters::double precision / 111000)) 
                            AND (user_lat + (radius_meters::double precision / 111000))
        AND ps.longitude BETWEEN (user_lng - (radius_meters::double precision / (111000 * cos(radians(user_lat))))) 
                             AND (user_lng + (radius_meters::double precision / (111000 * cos(radians(user_lat)))))
    ORDER BY 
        -- Simple distance approximation for ordering
        (abs(ps.latitude::double precision - user_lat) + abs(ps.longitude::double precision - user_lng))
    LIMIT max_results;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_nearby_spots_basic TO anon, authenticated;

-- Test the basic function
SELECT 'Testing basic function...' as status;
SELECT id, latitude, longitude, address, spot_type 
FROM get_nearby_spots_basic(51.5074, -0.1278, 5000, 5);
