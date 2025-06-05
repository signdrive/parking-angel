-- Drop any existing versions of the function
DROP FUNCTION IF EXISTS find_nearby_spots(numeric, numeric, integer, text, numeric, boolean);
DROP FUNCTION IF EXISTS find_nearby_spots(double precision, double precision, integer);
DROP FUNCTION IF EXISTS find_nearby_spots(numeric, numeric, integer);

-- Create the function with the correct column names based on our table structure
CREATE OR REPLACE FUNCTION find_nearby_spots(
    user_lat numeric,
    user_lng numeric,
    radius_meters integer DEFAULT 500,
    spot_type_filter text DEFAULT NULL,
    max_price numeric DEFAULT NULL,
    only_available boolean DEFAULT true
)
RETURNS TABLE (
    id uuid,
    latitude numeric,
    longitude numeric,
    address text,
    spot_type text,
    is_available boolean,
    distance_meters double precision,
    expires_at timestamp with time zone,
    confidence_score integer,
    price_per_hour numeric,
    max_duration_hours integer,
    created_at timestamp with time zone,
    reporter_name text,
    avg_rating numeric
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
        ST_Distance(
            ps.location,
            ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
        ) as distance_meters,
        ps.expires_at,
        ps.confidence_score,
        ps.price_per_hour,
        ps.max_duration_hours,
        ps.created_at,
        p.full_name as reporter_name,
        COALESCE(AVG(sr.rating), 0) as avg_rating
    FROM public.parking_spots ps
    LEFT JOIN public.profiles p ON ps.reported_by = p.id
    LEFT JOIN public.spot_reviews sr ON ps.id = sr.spot_id
    WHERE 
        (only_available = false OR ps.is_available = true)
        AND ps.expires_at > NOW()
        AND ST_DWithin(
            ps.location,
            ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
            radius_meters
        )
        AND (spot_type_filter IS NULL OR ps.spot_type = spot_type_filter)
        AND (max_price IS NULL OR ps.price_per_hour IS NULL OR ps.price_per_hour <= max_price)
    GROUP BY ps.id, p.full_name
    ORDER BY distance_meters ASC, avg_rating DESC
    LIMIT 50;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error and return empty result
        RAISE LOG 'Error in find_nearby_spots: %', SQLERRM;
        RETURN;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION find_nearby_spots(numeric, numeric, integer, text, numeric, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION find_nearby_spots(numeric, numeric, integer, text, numeric, boolean) TO anon;

-- Test the function with sample coordinates (San Francisco)
SELECT * FROM find_nearby_spots(37.7749, -122.4194, 1000) LIMIT 5;
