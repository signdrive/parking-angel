-- Fix parking_spots table schema to match the expected structure
-- This addresses the HTTP 400 errors by ensuring proper table structure

-- First, let's check what exists
DO $$
BEGIN
    -- Check if parking_spots table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'parking_spots') THEN
        RAISE NOTICE 'parking_spots table exists';
    ELSE
        RAISE NOTICE 'parking_spots table does not exist - creating it';
    END IF;
END $$;

-- Drop and recreate the table with the correct structure
DROP TABLE IF EXISTS parking_spots CASCADE;

CREATE TABLE parking_spots (
    id TEXT PRIMARY KEY,  -- Changed from UUID to TEXT to support google_ and osm_ prefixes
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    address TEXT,
    spot_type TEXT CHECK (spot_type IN ('street', 'garage', 'lot', 'meter', 'private')) DEFAULT 'street',
    is_available BOOLEAN DEFAULT true,
    reported_by UUID REFERENCES auth.users(id),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '2 hours'),
    confidence_score INTEGER DEFAULT 100 CHECK (confidence_score >= 0 AND confidence_score <= 100),
    price_per_hour DECIMAL(10, 2),
    max_duration_hours INTEGER,
    total_spaces INTEGER,
    available_spaces INTEGER,
    restrictions TEXT[],
    payment_methods TEXT[],
    accessibility BOOLEAN DEFAULT false,
    covered BOOLEAN DEFAULT false,
    security BOOLEAN DEFAULT false,
    ev_charging BOOLEAN DEFAULT false,
    provider TEXT DEFAULT 'user_reported',
    provider_id TEXT,
    real_time_data BOOLEAN DEFAULT false,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Add location column for PostGIS if available
    location GEOGRAPHY(POINT, 4326) GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)) STORED
);

-- Create indexes for better performance
CREATE INDEX idx_parking_spots_location ON parking_spots USING GIST (location);
CREATE INDEX idx_parking_spots_available ON parking_spots (is_available);
CREATE INDEX idx_parking_spots_type ON parking_spots (spot_type);
CREATE INDEX idx_parking_spots_provider ON parking_spots (provider);
CREATE INDEX idx_parking_spots_expires ON parking_spots (expires_at);

-- Enable RLS
ALTER TABLE parking_spots ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public read access for parking spots" ON parking_spots
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert parking spots" ON parking_spots
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own parking spots" ON parking_spots
    FOR UPDATE USING (auth.uid() = reported_by);

-- Insert some sample data to test with
INSERT INTO parking_spots (
    id, latitude, longitude, address, spot_type, is_available, provider
) VALUES 
    ('google_ChIJAZFO6X9Rw0cRPMnHnH_dm54', 51.5074, -0.1278, 'London, UK', 'garage', true, 'google_places'),
    ('osm_1180649490', 51.5085, -0.1257, 'Westminster, London', 'street', true, 'openstreetmap'),
    ('osm_223128866', 51.5095, -0.1267, 'Central London', 'lot', true, 'openstreetmap'),
    ('user_spot_001', 51.5105, -0.1287, 'User Reported Spot', 'meter', true, 'user_reported'),
    ('tfl_001', 51.5115, -0.1297, 'TfL Car Park', 'garage', true, 'tfl');

-- Update the updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_parking_spots_updated_at 
    BEFORE UPDATE ON parking_spots 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON parking_spots TO authenticated;
GRANT SELECT ON parking_spots TO anon;

COMMIT;
