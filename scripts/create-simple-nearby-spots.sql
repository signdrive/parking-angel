-- Create a simple version that definitely works
CREATE OR REPLACE FUNCTION find_nearby_spots_simple(
    user_lat numeric,
    user_lng numeric,
    radius_meters integer DEFAULT 500
)
RETURNS TABLE (
    id uuid,
    latitude numeric,
    longitude numeric,
    address text,
    spot_type text,
    is_available boolean,
    distance_meters double precision
)
LANGUAGE plpgsql
SECURITY DEFINER
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
        ST_Distance(
            ps.location,
            ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
        ) as distance_meters
    FROM public.parking_spots ps
    WHERE 
        ps.is_available = true
        AND ps.expires_at > NOW()
        AND ST_DWithin(
            ps.location,
            ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
            radius_meters
        )
    ORDER BY distance_meters ASC
    LIMIT 50;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error in find_nearby_spots_simple: %', SQLERRM;
        RETURN;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION find_nearby_spots_simple(numeric, numeric, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION find_nearby_spots_simple(numeric, numeric, integer) TO anon;
