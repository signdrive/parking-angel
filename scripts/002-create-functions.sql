-- Function to find nearby parking spots with enhanced features
CREATE OR REPLACE FUNCTION find_nearby_spots(
    user_lat DECIMAL,
    user_lng DECIMAL,
    radius_meters INTEGER DEFAULT 500,
    spot_type_filter TEXT DEFAULT NULL,
    max_price DECIMAL DEFAULT NULL,
    only_available BOOLEAN DEFAULT true
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
    price_per_hour DECIMAL,
    max_duration_hours INTEGER,
    restrictions TEXT[],
    created_at TIMESTAMP WITH TIME ZONE,
    reporter_name TEXT,
    avg_rating DECIMAL
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
        ps.price_per_hour,
        ps.max_duration_hours,
        ps.restrictions,
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired spots
CREATE OR REPLACE FUNCTION cleanup_expired_spots()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.parking_spots 
    WHERE expires_at < NOW() AND is_available = true;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log the cleanup activity
    INSERT INTO public.user_activities (user_id, activity_type, activity_data)
    VALUES (
        NULL, 
        'system_cleanup', 
        jsonb_build_object('deleted_spots', deleted_count, 'timestamp', NOW())
    );
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user reputation
CREATE OR REPLACE FUNCTION update_user_reputation(
    user_id UUID,
    reputation_change INTEGER
)
RETURNS VOID AS $$
BEGIN
    UPDATE public.profiles 
    SET 
        reputation_score = GREATEST(0, LEAST(1000, reputation_score + reputation_change)),
        updated_at = NOW()
    WHERE id = user_id;
    
    -- Log the reputation change
    INSERT INTO public.user_activities (user_id, activity_type, activity_data)
    VALUES (
        user_id,
        'reputation_change',
        jsonb_build_object('change', reputation_change, 'timestamp', NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate parking demand in an area
CREATE OR REPLACE FUNCTION calculate_parking_demand(
    center_lat DECIMAL,
    center_lng DECIMAL,
    radius_meters INTEGER DEFAULT 1000
)
RETURNS TABLE (
    total_spots INTEGER,
    available_spots INTEGER,
    demand_ratio DECIMAL,
    avg_confidence DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_spots,
        COUNT(CASE WHEN is_available THEN 1 END)::INTEGER as available_spots,
        CASE 
            WHEN COUNT(*) > 0 THEN 
                ROUND((COUNT(*) - COUNT(CASE WHEN is_available THEN 1 END))::DECIMAL / COUNT(*)::DECIMAL, 3)
            ELSE 0
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

-- Function to get user statistics
CREATE OR REPLACE FUNCTION get_user_stats(user_id UUID)
RETURNS TABLE (
    total_reports INTEGER,
    successful_reports INTEGER,
    reputation_score INTEGER,
    avg_spot_rating DECIMAL,
    total_reviews INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT ps.id)::INTEGER as total_reports,
        COUNT(DISTINCT CASE WHEN sr.report_type = 'available' THEN ps.id END)::INTEGER as successful_reports,
        p.reputation_score,
        COALESCE(AVG(rev.rating), 0) as avg_spot_rating,
        COUNT(DISTINCT rev.id)::INTEGER as total_reviews
    FROM public.profiles p
    LEFT JOIN public.parking_spots ps ON p.id = ps.reported_by
    LEFT JOIN public.spot_reports sr ON ps.id = sr.spot_id
    LEFT JOIN public.spot_reviews rev ON ps.id = rev.spot_id
    WHERE p.id = user_id
    GROUP BY p.id, p.reputation_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create AI prediction
CREATE OR REPLACE FUNCTION create_ai_prediction(
    pred_lat DECIMAL,
    pred_lng DECIMAL,
    pred_type TEXT,
    pred_data JSONB,
    confidence DECIMAL,
    valid_hours INTEGER DEFAULT 24
)
RETURNS UUID AS $$
DECLARE
    prediction_id UUID;
BEGIN
    INSERT INTO public.ai_predictions (
        location,
        prediction_type,
        prediction_data,
        confidence_score,
        valid_until
    ) VALUES (
        ST_SetSRID(ST_MakePoint(pred_lng, pred_lat), 4326)::geography,
        pred_type,
        pred_data,
        confidence,
        NOW() + (valid_hours || ' hours')::INTERVAL
    ) RETURNING id INTO prediction_id;
    
    RETURN prediction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle profile creation/update
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
        avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update spot confidence based on reports
CREATE OR REPLACE FUNCTION update_spot_confidence()
RETURNS TRIGGER AS $$
DECLARE
    spot_confidence INTEGER;
    report_count INTEGER;
    positive_reports INTEGER;
BEGIN
    -- Count total reports and positive reports for this spot
    SELECT 
        COUNT(*),
        COUNT(CASE WHEN report_type IN ('available', 'taken') THEN 1 END)
    INTO report_count, positive_reports
    FROM public.spot_reports
    WHERE spot_id = NEW.spot_id;
    
    -- Calculate new confidence score
    IF report_count > 0 THEN
        spot_confidence := LEAST(100, GREATEST(0, 
            50 + (positive_reports * 50 / report_count) - 
            ((report_count - positive_reports) * 25)
        ));
    ELSE
        spot_confidence := 100;
    END IF;
    
    -- Update the parking spot
    UPDATE public.parking_spots
    SET 
        confidence_score = spot_confidence,
        updated_at = NOW()
    WHERE id = NEW.spot_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

DROP TRIGGER IF EXISTS on_spot_report_created ON public.spot_reports;
CREATE TRIGGER on_spot_report_created
    AFTER INSERT ON public.spot_reports
    FOR EACH ROW EXECUTE FUNCTION update_spot_confidence();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
