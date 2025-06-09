-- Fix cleanup function
CREATE OR REPLACE FUNCTION cleanup_expired_spots()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.parking_spots 
    WHERE expires_at < NOW() AND is_available = true;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log the cleanup activity (only if user_activities table exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_activities') THEN
        INSERT INTO public.user_activities (user_id, activity_type, activity_data)
        VALUES (
            NULL, 
            'system_cleanup', 
            jsonb_build_object('deleted_spots', deleted_count, 'timestamp', NOW())
        );
    END IF;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix parking demand calculation function
CREATE OR REPLACE FUNCTION calculate_parking_demand(
    center_lat numeric,
    center_lng numeric,
    radius_meters integer DEFAULT 1000
)
RETURNS TABLE (
    total_spots integer,
    available_spots integer,
    demand_ratio numeric,
    avg_confidence numeric
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::integer as total_spots,
        COUNT(CASE WHEN is_available THEN 1 END)::integer as available_spots,
        CASE 
            WHEN COUNT(*) > 0 THEN 
                ROUND((COUNT(*) - COUNT(CASE WHEN is_available THEN 1 END))::numeric / COUNT(*)::numeric, 3)
            ELSE 0::numeric
        END as demand_ratio,
        ROUND(AVG(confidence_score), 1) as avg_confidence
    FROM public.parking_spots
    WHERE 
        expires_at > NOW()
        AND ST_DWithin(
            location,
            ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326)::geography,
            radius_meters
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION cleanup_expired_spots() TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_parking_demand(numeric, numeric, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_parking_demand(numeric, numeric, integer) TO anon;
