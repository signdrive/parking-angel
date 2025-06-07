-- Fix database schema issues causing 400/404 errors

-- First, check the current schema of parking_spots
DO $$ 
DECLARE
    id_type TEXT;
BEGIN
    -- Get the data type of the id column in parking_spots
    SELECT data_type INTO id_type 
    FROM information_schema.columns 
    WHERE table_name = 'parking_spots' AND column_name = 'id';
    
    RAISE NOTICE 'Current id column type: %', id_type;
END $$;

-- Create parking_usage_history table if it doesn't exist
CREATE TABLE IF NOT EXISTS parking_usage_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    spot_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL CHECK (action IN ('occupied', 'vacated', 'reserved')),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    duration_minutes INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns to parking_spots if they don't exist
DO $$ 
BEGIN
    -- Add columns if they don't exist
    BEGIN
        ALTER TABLE parking_spots ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true;
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
    
    BEGIN
        ALTER TABLE parking_spots ADD COLUMN IF NOT EXISTS last_updated TIMESTAMPTZ DEFAULT NOW();
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
    
    BEGIN
        ALTER TABLE parking_spots ADD COLUMN IF NOT EXISTS spot_type TEXT DEFAULT 'street';
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
    
    BEGIN
        ALTER TABLE parking_spots ADD COLUMN IF NOT EXISTS address TEXT;
    EXCEPTION WHEN OTHERS THEN
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

-- Insert some test data using proper UUIDs
INSERT INTO parking_spots (id, latitude, longitude, spot_type, address, is_available) VALUES
(uuid_generate_v4(), 52.3676, 4.9041, 'street', 'Test Street 1, Amsterdam', true),
(uuid_generate_v4(), 52.3676, 4.9042, 'garage', 'Test Garage 1, Amsterdam', false),
(uuid_generate_v4(), 52.3677, 4.9043, 'street', 'Test Street 2, Amsterdam', true);

-- Insert some test usage history with proper UUIDs
-- First get some spot IDs that were just inserted
DO $$ 
DECLARE
    spot_id1 UUID;
    spot_id2 UUID;
BEGIN
    SELECT id INTO spot_id1 FROM parking_spots WHERE address = 'Test Street 1, Amsterdam' LIMIT 1;
    SELECT id INTO spot_id2 FROM parking_spots WHERE address = 'Test Garage 1, Amsterdam' LIMIT 1;
    
    IF spot_id1 IS NOT NULL THEN
        INSERT INTO parking_usage_history (spot_id, action, timestamp) VALUES
        (spot_id1, 'occupied', NOW() - INTERVAL '2 hours'),
        (spot_id1, 'vacated', NOW() - INTERVAL '1 hour');
    END IF;
    
    IF spot_id2 IS NOT NULL THEN
        INSERT INTO parking_usage_history (spot_id, action, timestamp) VALUES
        (spot_id2, 'occupied', NOW() - INTERVAL '30 minutes');
    END IF;
END $$;

-- Grant necessary permissions
GRANT ALL ON parking_spots TO authenticated;
GRANT ALL ON parking_usage_history TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
