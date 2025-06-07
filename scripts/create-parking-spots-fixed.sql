-- This script creates the parking_spots table with proper error handling

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

-- Drop the existing tables to start fresh
DROP TABLE IF EXISTS parking_usage_history CASCADE;
DROP TABLE IF EXISTS parking_spots CASCADE;

-- Create the new parking_spots table with string IDs
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
CREATE INDEX idx_parking_spots_location ON parking_spots(latitude, longitude);
CREATE INDEX idx_parking_spots_available ON parking_spots(is_available);
CREATE INDEX idx_parking_usage_history_spot_id ON parking_usage_history(spot_id);
CREATE INDEX idx_parking_usage_history_timestamp ON parking_usage_history(timestamp);

-- Set up RLS policies
ALTER TABLE parking_spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE parking_usage_history ENABLE ROW LEVEL SECURITY;

-- Allow read access to parking spots for all users (including anonymous)
CREATE POLICY "Allow read access to parking spots" ON parking_spots
    FOR SELECT USING (true);

-- Allow insert/update for authenticated users
CREATE POLICY "Allow insert parking spots" ON parking_spots
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow update parking spots" ON parking_spots
    FOR UPDATE TO authenticated USING (true);

-- Allow insert/update for parking usage history
CREATE POLICY "Allow insert parking usage history" ON parking_usage_history
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow read parking usage history" ON parking_usage_history
    FOR SELECT USING (true);

-- Insert some test data with the exact IDs from your error log
INSERT INTO parking_spots (id, latitude, longitude, spot_type, address, is_available, restrictions) VALUES
('google_ChIJAZFO6X9Rw0cRPMnHnH_dm54', 52.3676, 4.9041, 'street', 'Damrak 1, Amsterdam', true, ARRAY['2 hour max']),
('google_ChIJtXeV6cVQw0cRdqges2xroWo', 52.3676, 4.9042, 'garage', 'Parking Garage Central, Amsterdam', false, ARRAY['24/7 access']),
('google_ChIJkzhLRNpQw0cRXHn_l_QXEK8', 52.3677, 4.9043, 'street', 'Nieuwmarkt 2, Amsterdam', true, ARRAY['residents only 18:00-09:00']),
('google_ChIJqSoVJ-hQw0cRblmMjw9R5Ko', 52.3678, 4.9044, 'lot', 'Public Parking Lot, Amsterdam', true, ARRAY['€2.50/hour']),
('google_ChIJK_xdmtxQw0cR1DFNPXOHZLc', 52.3679, 4.9045, 'street', 'Spui 3, Amsterdam', true, ARRAY['loading zone 07:00-11:00']),
('osm_763127704', 52.3680, 4.9046, 'street', 'Kalverstraat 4, Amsterdam', true, ARRAY['short stay only']),
('osm_299924039', 52.3681, 4.9047, 'garage', 'Underground Parking, Amsterdam', false, ARRAY['height limit 2.1m']),
('osm_515069098', 52.3682, 4.9048, 'street', 'Rokin 5, Amsterdam', true, ARRAY['paid parking 09:00-19:00']),
('osm_586048352', 52.3683, 4.9049, 'lot', 'Park & Ride, Amsterdam', true, ARRAY['€5/day']),
('osm_589047127', 52.3684, 4.9050, 'street', 'Leidsestraat 6, Amsterdam', true, ARRAY['no parking Sunday']);

-- Insert some test usage history for these spots
INSERT INTO parking_usage_history (spot_id, action, timestamp) VALUES
('google_ChIJAZFO6X9Rw0cRPMnHnH_dm54', 'occupied', NOW() - INTERVAL '2 hours'),
('google_ChIJAZFO6X9Rw0cRPMnHnH_dm54', 'vacated', NOW() - INTERVAL '1 hour'),
('google_ChIJtXeV6cVQw0cRdqges2xroWo', 'occupied', NOW() - INTERVAL '30 minutes'),
('osm_299924039', 'occupied', NOW() - INTERVAL '4 hours'),
('osm_299924039', 'vacated', NOW() - INTERVAL '3 hours'),
('osm_515069098', 'reserved', NOW() - INTERVAL '15 minutes');

-- Grant necessary permissions
GRANT ALL ON parking_spots TO authenticated;
GRANT ALL ON parking_usage_history TO authenticated;
GRANT ALL ON parking_spots TO anon;
GRANT SELECT ON parking_usage_history TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Verify the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'parking_spots' 
ORDER BY ordinal_position;
