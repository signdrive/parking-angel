-- Comprehensive database connectivity fixes
-- Run this script to resolve common 503 Service Unavailable issues

-- 1. Check if parking_spots table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'parking_spots') THEN
        RAISE NOTICE 'Creating parking_spots table...';
        
        CREATE TABLE parking_spots (
            id TEXT PRIMARY KEY,
            latitude NUMERIC(10,8) NOT NULL,
            longitude NUMERIC(11,8) NOT NULL,
            address TEXT,
            spot_type TEXT NOT NULL CHECK (spot_type IN ('street', 'garage', 'lot', 'meter', 'private')),
            is_available BOOLEAN DEFAULT true,
            reported_by UUID REFERENCES auth.users(id),
            expires_at TIMESTAMPTZ,
            confidence_score INTEGER DEFAULT 100 CHECK (confidence_score >= 0 AND confidence_score <= 100),
            price_per_hour DECIMAL(10,2),
            max_duration_hours INTEGER,
            total_spaces INTEGER,
            available_spaces INTEGER,
            restrictions TEXT[],
            payment_methods TEXT[],
            accessibility BOOLEAN DEFAULT false,
            covered BOOLEAN DEFAULT false,
            security BOOLEAN DEFAULT false,
            ev_charging BOOLEAN DEFAULT false,
            provider TEXT DEFAULT 'user_report',
            provider_id TEXT,
            real_time_data BOOLEAN DEFAULT false,
            last_updated TIMESTAMPTZ DEFAULT NOW(),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            location GEOGRAPHY(POINT, 4326) GENERATED ALWAYS AS (ST_Point(longitude, latitude)) STORED
        );
        
        -- Create indexes for performance
        CREATE INDEX idx_parking_spots_location ON parking_spots USING GIST (location);
        CREATE INDEX idx_parking_spots_available ON parking_spots (is_available);
        CREATE INDEX idx_parking_spots_expires ON parking_spots (expires_at);
        CREATE INDEX idx_parking_spots_provider ON parking_spots (provider);
        
        RAISE NOTICE 'parking_spots table created successfully';
    ELSE
        RAISE NOTICE 'parking_spots table already exists';
    END IF;
END $$;

-- 2. Fix Row Level Security policies
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON parking_spots;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON parking_spots;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON parking_spots;

-- Enable RLS
ALTER TABLE parking_spots ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for public access
CREATE POLICY "Enable read access for all users" ON parking_spots
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON parking_spots
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON parking_spots
    FOR UPDATE USING (true);

-- 3. Create or replace the nearby spots function
CREATE OR REPLACE FUNCTION get_nearby_parking_spots(
    user_lat DOUBLE PRECISION,
    user_lng DOUBLE PRECISION,
    radius_meters INTEGER DEFAULT 1000,
    max_results INTEGER DEFAULT 50
)
RETURNS TABLE (
    id TEXT,
    latitude NUMERIC,
    longitude NUMERIC,
    address TEXT,
    spot_type TEXT,
    is_available BOOLEAN,
    price_per_hour DECIMAL,
    provider TEXT,
    confidence_score INTEGER,
    distance_meters DOUBLE PRECISION
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
        ps.provider,
        ps.confidence_score,
        ST_Distance(
            ps.location,
            ST_Point(user_lng, user_lat)::geography
        ) as distance_meters
    FROM parking_spots ps
    WHERE 
        ps.is_available = true
        AND (ps.expires_at IS NULL OR ps.expires_at > NOW())
        AND ST_DWithin(
            ps.location,
            ST_Point(user_lng, user_lat)::geography,
            radius_meters
        )
    ORDER BY distance_meters ASC
    LIMIT max_results;
END;
$$;

-- 4. Insert sample data if table is empty
DO $$
BEGIN
    IF (SELECT COUNT(*) FROM parking_spots) = 0 THEN
        RAISE NOTICE 'Inserting sample parking data...';
        
        INSERT INTO parking_spots (
            id, latitude, longitude, address, spot_type, is_available, 
            provider, confidence_score, expires_at
        ) VALUES
        ('sample_london_1', 51.5074, -0.1278, 'London, UK - Westminster', 'street', true, 'system', 90, NOW() + INTERVAL '24 hours'),
        ('sample_london_2', 51.5085, -0.1257, 'London, UK - Covent Garden', 'garage', true, 'system', 85, NOW() + INTERVAL '24 hours'),
        ('sample_london_3', 51.5095, -0.1267, 'London, UK - Oxford Street', 'lot', true, 'system', 80, NOW() + INTERVAL '24 hours'),
        ('sample_paris_1', 48.8566, 2.3522, 'Paris, France - Louvre', 'street', true, 'system', 88, NOW() + INTERVAL '24 hours'),
        ('sample_berlin_1', 52.5200, 13.4050, 'Berlin, Germany - Brandenburg Gate', 'garage', true, 'system', 92, NOW() + INTERVAL '24 hours');
        
        RAISE NOTICE 'Sample data inserted successfully';
    ELSE
        RAISE NOTICE 'Parking spots table already contains data';
    END IF;
END $$;

-- 5. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON parking_spots TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_nearby_parking_spots TO anon, authenticated;

-- 6. Refresh the schema cache
NOTIFY pgrst, 'reload schema';

-- Final verification
SELECT 
    'Database setup completed successfully' as status,
    COUNT(*) as total_spots,
    COUNT(*) FILTER (WHERE is_available = true) as available_spots
FROM parking_spots;
