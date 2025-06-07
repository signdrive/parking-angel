-- This script creates a new parking_spots table that uses string IDs
-- for Google Places and OSM IDs instead of UUIDs

-- First, check if we need to create the extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create a backup of the existing table if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'parking_spots') THEN
        DROP TABLE IF EXISTS parking_spots_backup;
        CREATE TABLE parking_spots_backup AS SELECT * FROM parking_spots;
        RAISE NOTICE 'Created backup of parking_spots table';
    END IF;
END $$;

-- Drop the existing table
DROP TABLE IF EXISTS parking_spots CASCADE;

-- Create the new table with string IDs
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

-- Create the parking_usage_history table with string spot_ids
DROP TABLE IF EXISTS parking_usage_history CASCADE;
CREATE TABLE parking_usage_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    spot_id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL CHECK (action IN ('occupied', 'vacated', 'reserved')),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    duration_minutes INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_parking_spots_location ON parking_spots(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_parking_spots_available ON parking_spots(is_available);
CREATE INDEX IF NOT EXISTS idx_parking_usage_history_spot_id ON parking_usage_history(spot_id);
CREATE INDEX IF NOT EXISTS idx_parking_usage_history_timestamp ON parking_usage_history(timestamp);

-- Set up RLS policies
ALTER TABLE parking_spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE parking_usage_history ENABLE ROW LEVEL SECURITY;

-- Allow read access to parking spots for all authenticated users
CREATE POLICY "Allow read access to parking spots" ON parking_spots
    FOR SELECT TO authenticated USING (true);

-- Allow insert/update for authenticated users
CREATE POLICY "Allow insert parking spots" ON parking_spots
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow update parking spots" ON parking_spots
    FOR UPDATE TO authenticated USING (true);

-- Allow insert/update for parking usage history
CREATE POLICY "Allow insert parking usage history" ON parking_usage_history
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow read parking usage history" ON parking_usage_history
    FOR SELECT TO authenticated USING (true);

-- Insert some test data with string IDs
INSERT INTO parking_spots (id, latitude, longitude, spot_type, address, is_available) VALUES
('google_ChIJAZFO6X9Rw0cRPMnHnH_dm54', 52.3676, 4.9041, 'street', 'Test Street 1, Amsterdam', true),
('google_ChIJtXeV6cVQw0cRdqges2xroWo', 52.3676, 4.9042, 'garage', 'Test Garage 1, Amsterdam', false),
('osm_299924039', 52.3677, 4.9043, 'street', 'Test Street 2, Amsterdam', true);

-- Insert some test usage history
INSERT INTO parking_usage_history (spot_id, action, timestamp) VALUES
('google_ChIJAZFO6X9Rw0cRPMnHnH_dm54', 'occupied', NOW() - INTERVAL '2 hours'),
('google_ChIJAZFO6X9Rw0cRPMnHnH_dm54', 'vacated', NOW() - INTERVAL '1 hour'),
('google_ChIJtXeV6cVQw0cRdqges2xroWo', 'occupied', NOW() - INTERVAL '30 minutes');

-- Grant necessary permissions
GRANT ALL ON parking_spots TO authenticated;
GRANT ALL ON parking_usage_history TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
