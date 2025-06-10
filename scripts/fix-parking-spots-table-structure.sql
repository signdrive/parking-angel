-- Fix parking_spots table structure to match the function expectations
-- First, let's check what columns actually exist and add missing ones

-- Add missing columns to parking_spots table
DO $$
BEGIN
    -- Add reported_by column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'parking_spots' AND column_name = 'reported_by') THEN
        ALTER TABLE parking_spots ADD COLUMN reported_by UUID REFERENCES auth.users(id);
    END IF;
    
    -- Add location column (geography) if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'parking_spots' AND column_name = 'location') THEN
        ALTER TABLE parking_spots ADD COLUMN location GEOGRAPHY(POINT, 4326);
    END IF;
    
    -- Add expires_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'parking_spots' AND column_name = 'expires_at') THEN
        ALTER TABLE parking_spots ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours');
    END IF;
    
    -- Add confidence_score column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'parking_spots' AND column_name = 'confidence_score') THEN
        ALTER TABLE parking_spots ADD COLUMN confidence_score INTEGER DEFAULT 100;
    END IF;
    
    -- Add price_per_hour column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'parking_spots' AND column_name = 'price_per_hour') THEN
        ALTER TABLE parking_spots ADD COLUMN price_per_hour DECIMAL(10,2);
    END IF;
    
    -- Add max_duration_hours column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'parking_spots' AND column_name = 'max_duration_hours') THEN
        ALTER TABLE parking_spots ADD COLUMN max_duration_hours INTEGER;
    END IF;
    
    -- Add restrictions column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'parking_spots' AND column_name = 'restrictions') THEN
        ALTER TABLE parking_spots ADD COLUMN restrictions TEXT[];
    END IF;
    
    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'parking_spots' AND column_name = 'created_at') THEN
        ALTER TABLE parking_spots ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Update location column based on latitude/longitude if it's empty
UPDATE parking_spots 
SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
WHERE location IS NULL AND latitude IS NOT NULL AND longitude IS NOT NULL;

-- Create a simplified find_nearby_spots function that works with existing data
CREATE OR REPLACE FUNCTION find_nearby_spots_simple(
    user_lat DECIMAL,
    user_lng DECIMAL,
    radius_meters INTEGER DEFAULT 500
)
RETURNS TABLE (
    id TEXT,
    latitude DECIMAL,
    longitude DECIMAL,
    address TEXT,
    spot_type TEXT,
    is_available BOOLEAN,
    distance_meters DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ps.id::TEXT,
        ps.latitude,
        ps.longitude,
        COALESCE(ps.address, 'Unknown Address') as address,
        COALESCE(ps.spot_type, 'street') as spot_type,
        COALESCE(ps.is_available, true) as is_available,
        ST_Distance(
            ST_SetSRID(ST_MakePoint(ps.longitude::double precision, ps.latitude::double precision), 4326)::geography,
            ST_SetSRID(ST_MakePoint(user_lng::double precision, user_lat::double precision), 4326)::geography
        ) as distance_meters
    FROM parking_spots ps
    WHERE 
        ps.latitude IS NOT NULL 
        AND ps.longitude IS NOT NULL
        AND ST_DWithin(
            ST_SetSRID(ST_MakePoint(ps.longitude::double precision, ps.latitude::double precision), 4326)::geography,
            ST_SetSRID(ST_MakePoint(user_lng::double precision, user_lat::double precision), 4326)::geography,
            radius_meters
        )
    ORDER BY distance_meters ASC
    LIMIT 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION find_nearby_spots_simple(DECIMAL, DECIMAL, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION find_nearby_spots_simple(DECIMAL, DECIMAL, INTEGER) TO anon;

-- Test the function with San Francisco coordinates
SELECT * FROM find_nearby_spots_simple(37.7749, -122.4194, 5000) LIMIT 5;
