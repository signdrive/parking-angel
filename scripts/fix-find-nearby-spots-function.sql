-- Drop and recreate the find_nearby_spots function with better error handling
DROP FUNCTION IF EXISTS find_nearby_spots(double precision, double precision, integer);

CREATE OR REPLACE FUNCTION find_nearby_spots(
    user_lat double precision,
    user_lng double precision,
    radius_meters integer DEFAULT 500
)
RETURNS TABLE (
    id uuid,
    latitude double precision,
    longitude double precision,
    address text,
    spot_type text,
    availability_status text,
    price_per_hour numeric,
    max_duration_hours integer,
    distance_meters double precision,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
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
        ps.availability_status,
        ps.price_per_hour,
        ps.max_duration_hours,
        -- Calculate distance using Haversine formula (approximate)
        (6371000 * acos(
            cos(radians(user_lat)) * 
            cos(radians(ps.latitude)) * 
            cos(radians(ps.longitude) - radians(user_lng)) + 
            sin(radians(user_lat)) * 
            sin(radians(ps.latitude))
        ))::double precision as distance_meters,
        ps.created_at,
        ps.updated_at
    FROM parking_spots ps
    WHERE 
        ps.availability_status = 'available'
        AND (
            6371000 * acos(
                cos(radians(user_lat)) * 
                cos(radians(ps.latitude)) * 
                cos(radians(ps.longitude) - radians(user_lng)) + 
                sin(radians(user_lat)) * 
                sin(radians(ps.latitude))
            )
        ) <= radius_meters
    ORDER BY distance_meters ASC
    LIMIT 50;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error and return empty result
        RAISE LOG 'Error in find_nearby_spots: %', SQLERRM;
        RETURN;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION find_nearby_spots(double precision, double precision, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION find_nearby_spots(double precision, double precision, integer) TO anon;

-- Test the function with sample data
SELECT * FROM find_nearby_spots(37.7749, -122.4194, 1000) LIMIT 5;
