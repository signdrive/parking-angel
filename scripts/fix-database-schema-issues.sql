-- Fix database schema issues causing 400/404 errors

-- First, check if tables exist and recreate if necessary
DO $$ 
BEGIN
    -- Drop and recreate parking_usage_history if it has issues
    DROP TABLE IF EXISTS parking_usage_history CASCADE;
    
    CREATE TABLE parking_usage_history (
        id BIGSERIAL PRIMARY KEY,
        spot_id TEXT NOT NULL,
        user_id UUID REFERENCES auth.users(id),
        action TEXT NOT NULL CHECK (action IN ('occupied', 'vacated', 'reserved')),
        timestamp TIMESTAMPTZ DEFAULT NOW(),
        duration_minutes INTEGER,
        created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Ensure parking_spots table has correct structure
    -- Check if parking_spots exists, if not create it
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'parking_spots') THEN
        CREATE TABLE parking_spots (
            id TEXT PRIMARY KEY,
            latitude DOUBLE PRECISION NOT NULL,
            longitude DOUBLE PRECISION NOT NULL,
            spot_type TEXT DEFAULT 'street',
            address TEXT,
            is_available BOOLEAN DEFAULT true,
            last_updated TIMESTAMPTZ DEFAULT NOW(),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            price_per_hour DECIMAL(10,2),
            max_duration_hours INTEGER,
            restrictions TEXT[]
        );
    END IF;

    -- Add missing columns if they don't exist
    BEGIN
        ALTER TABLE parking_spots ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true;
        ALTER TABLE parking_spots ADD COLUMN IF NOT EXISTS last_updated TIMESTAMPTZ DEFAULT NOW();
        ALTER TABLE parking_spots ADD COLUMN IF NOT EXISTS spot_type TEXT DEFAULT 'street';
        ALTER TABLE parking_spots ADD COLUMN IF NOT EXISTS address TEXT;
    EXCEPTION WHEN OTHERS THEN
        -- Column might already exist, continue
        NULL;
    END;

END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_parking_usage_history_spot_id ON parking_usage_history(spot_id);
CREATE INDEX IF NOT EXISTS idx_parking_usage_history_timestamp ON parking_usage_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_parking_spots_location ON parking_spots(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_parking_spots_available ON parking_spots(is_available);

-- Set up RLS policies
ALTER TABLE parking_usage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE parking_spots ENABLE ROW LEVEL SECURITY;

-- Allow read access to parking spots for all authenticated users
DROP POLICY IF EXISTS "Allow read access to parking spots" ON parking_spots;
CREATE POLICY "Allow read access to parking spots" ON parking_spots
    FOR SELECT TO authenticated USING (true);

-- Allow insert/update for parking usage history
DROP POLICY IF EXISTS "Allow insert parking usage history" ON parking_usage_history;
CREATE POLICY "Allow insert parking usage history" ON parking_usage_history
    FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow read parking usage history" ON parking_usage_history;
CREATE POLICY "Allow read parking usage history" ON parking_usage_history
    FOR SELECT TO authenticated USING (true);

-- Insert some test data to verify the tables work
INSERT INTO parking_spots (id, latitude, longitude, spot_type, address, is_available) VALUES
('test_spot_1', 52.3676, 4.9041, 'street', 'Test Street 1, Amsterdam', true),
('test_spot_2', 52.3676, 4.9042, 'garage', 'Test Garage 1, Amsterdam', false),
('test_spot_3', 52.3677, 4.9043, 'street', 'Test Street 2, Amsterdam', true)
ON CONFLICT (id) DO UPDATE SET
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    spot_type = EXCLUDED.spot_type,
    address = EXCLUDED.address,
    is_available = EXCLUDED.is_available,
    last_updated = NOW();

-- Insert some test usage history
INSERT INTO parking_usage_history (spot_id, action, timestamp) VALUES
('test_spot_1', 'occupied', NOW() - INTERVAL '2 hours'),
('test_spot_1', 'vacated', NOW() - INTERVAL '1 hour'),
('test_spot_2', 'occupied', NOW() - INTERVAL '30 minutes');

-- Grant necessary permissions
GRANT ALL ON parking_spots TO authenticated;
GRANT ALL ON parking_usage_history TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
