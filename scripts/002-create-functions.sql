-- Function to find nearby parking spots
CREATE OR REPLACE FUNCTION find_nearby_spots(
    user_lat DECIMAL,
    user_lng DECIMAL,
    radius_meters INTEGER DEFAULT 500
)
RETURNS TABLE (
    id UUID,
    latitude DECIMAL,
    longitude DECIMAL,
    address TEXT,
    spot_type TEXT,
    is_available BOOLEAN,
    distance_meters DECIMAL,
    expires_at TIMESTAMP WITH TIME ZONE,
    confidence_score INTEGER,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
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
        ) as distance_meters,
        ps.expires_at,
        ps.confidence_score,
        ps.created_at
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
END;
$$ LANGUAGE plpgsql;

-- Function to clean up expired spots
CREATE OR REPLACE FUNCTION cleanup_expired_spots()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.parking_spots 
    WHERE expires_at < NOW() AND is_available = true;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to update user reputation
CREATE OR REPLACE FUNCTION update_user_reputation(
    user_id UUID,
    reputation_change INTEGER
)
RETURNS VOID AS $$
BEGIN
    UPDATE public.profiles 
    SET 
        reputation_score = GREATEST(0, reputation_score + reputation_change),
        total_reports = total_reports + 1,
        updated_at = NOW()
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically set the location field from latitude and longitude
CREATE OR REPLACE FUNCTION set_location_from_lat_lng()
RETURNS TRIGGER AS $$
BEGIN
    NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_parking_spot_location
BEFORE INSERT OR UPDATE ON public.parking_spots
FOR EACH ROW
EXECUTE FUNCTION set_location_from_lat_lng();
