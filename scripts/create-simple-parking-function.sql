-- Create the simplest possible function that just returns basic data
CREATE OR REPLACE FUNCTION get_available_parking_spots(
    max_results integer DEFAULT 50
)
RETURNS TABLE (
    id text,
    latitude numeric,
    longitude numeric,
    address text,
    spot_type text,
    is_available boolean,
    provider text,
    confidence_score integer
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
        ps.provider,
        ps.confidence_score
    FROM parking_spots ps
    WHERE 
        ps.is_available = true
        AND (ps.expires_at IS NULL OR ps.expires_at > NOW())
    ORDER BY ps.created_at DESC
    LIMIT max_results;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_available_parking_spots TO anon, authenticated;

-- Test the simple function
SELECT 'Testing simple function...' as status;
SELECT * FROM get_available_parking_spots(5);
