-- This script creates simplified parking tables to fix the 400/406 errors
-- It uses string IDs instead of UUIDs to match the frontend queries

-- Drop existing tables if they exist
DROP TABLE IF EXISTS parking_usage_history CASCADE;
DROP TABLE IF EXISTS parking_spots CASCADE;

-- Create simplified parking_spots table with string IDs
CREATE TABLE parking_spots (
    id TEXT PRIMARY KEY, -- String ID to match frontend queries (google_* or osm_*)
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    spot_type TEXT DEFAULT 'street',
    address TEXT,
    is_available BOOLEAN DEFAULT true,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create simplified parking_usage_history table
CREATE TABLE parking_usage_history (
    id SERIAL PRIMARY KEY,
    spot_id TEXT REFERENCES parking_spots(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_parking_spots_coords ON parking_spots(latitude, longitude);
CREATE INDEX idx_parking_spots_available ON parking_spots(is_available);
CREATE INDEX idx_parking_usage_history_spot_id ON parking_usage_history(spot_id);
CREATE INDEX idx_parking_usage_history_timestamp ON parking_usage_history(timestamp);

-- Enable RLS
ALTER TABLE parking_spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE parking_usage_history ENABLE ROW LEVEL SECURITY;

-- Create ultra-permissive policies
CREATE POLICY "Allow all access to parking spots" ON parking_spots FOR ALL USING (true);
CREATE POLICY "Allow all access to parking usage history" ON parking_usage_history FOR ALL USING (true);

-- Insert sample data for Google Places IDs
INSERT INTO parking_spots (id, latitude, longitude, spot_type, address, is_available) VALUES
('google_ChIJqSoVJ-hQw0cRblmMjw9R5Ko', 52.3680, 4.9046, 'street', 'Spui 3, Amsterdam', true),
('google_ChIJtXeV6cVQw0cRdqges2xroWo', 52.3679, 4.9045, 'lot', 'Public Lot, Amsterdam', true),
('google_ChIJrwmAAeNRw0cRl9CBUSuhFnM', 52.3683, 4.9049, 'street', 'Rokin 5, Amsterdam', true),
('google_ChIJ6eiLTOhQw0cRciypB-8i3mA', 52.3692, 4.9058, 'street', 'Canal Street 10, Amsterdam', true),
('google_ChIJ0wKH_V5Rw0cRRHoMsfQRvQg', 52.3694, 4.9060, 'street', 'Red Light District, Amsterdam', true),
('google_ChIJy-pTTuhQw0cRcxE-7JkxxF0', 52.3693, 4.9059, 'lot', 'Business District, Amsterdam', true),
('google_ChIJS7-x4ulRw0cRvZ8jFe737TM', 52.3684, 4.9050, 'lot', 'Park & Ride, Amsterdam', true),
('google_ChIJozhPpVdRw0cRLRq4i0LqZIE', 52.3687, 4.9053, 'garage', 'Museum Garage, Amsterdam', false);

-- Insert sample data for OSM IDs
INSERT INTO parking_spots (id, latitude, longitude, spot_type, address, is_available) VALUES
('osm_229430300', 52.3695, 4.9061, 'street', 'OSM Street 1, Amsterdam', true),
('osm_274494286', 52.3696, 4.9062, 'garage', 'OSM Underground, Amsterdam', false),
('osm_312201375', 52.3697, 4.9063, 'street', 'OSM Rokin, Amsterdam', true),
('osm_374484319', 52.3698, 4.9064, 'lot', 'OSM Park & Ride, Amsterdam', true),
('osm_374484330', 52.3699, 4.9065, 'street', 'OSM Leidsestraat, Amsterdam', true),
('osm_586048352', 52.3700, 4.9066, 'street', 'OSM Museumplein, Amsterdam', true),
('osm_589047127', 52.3701, 4.9067, 'garage', 'OSM Museum Garage, Amsterdam', false),
('osm_589052000', 52.3702, 4.9068, 'street', 'OSM Vondelpark, Amsterdam', true),
('osm_589197917', 52.3703, 4.9069, 'lot', 'OSM Concert Hall, Amsterdam', true),
('osm_591094619', 52.3704, 4.9070, 'street', 'OSM Jordaan, Amsterdam', true),
('osm_694507240', 52.3705, 4.9071, 'garage', 'OSM Shopping, Amsterdam', false),
('osm_696520424', 52.3706, 4.9072, 'street', 'OSM Canal, Amsterdam', true);

-- Insert sample usage history
INSERT INTO parking_usage_history (spot_id, action, timestamp) VALUES
('google_ChIJqSoVJ-hQw0cRblmMjw9R5Ko', 'occupied', NOW() - INTERVAL '2 hours'),
('google_ChIJqSoVJ-hQw0cRblmMjw9R5Ko', 'vacated', NOW() - INTERVAL '1 hour'),
('google_ChIJtXeV6cVQw0cRdqges2xroWo', 'occupied', NOW() - INTERVAL '30 minutes'),
('google_ChIJrwmAAeNRw0cRl9CBUSuhFnM', 'occupied', NOW() - INTERVAL '4 hours'),
('google_ChIJrwmAAeNRw0cRl9CBUSuhFnM', 'vacated', NOW() - INTERVAL '3 hours'),
('osm_229430300', 'occupied', NOW() - INTERVAL '2 hours'),
('osm_274494286', 'vacated', NOW() - INTERVAL '1 hour'),
('osm_312201375', 'occupied', NOW() - INTERVAL '30 minutes');

-- Verify the setup
SELECT 'Tables created successfully' as status;
SELECT 'Parking spots:' as info, COUNT(*) as count FROM parking_spots;
SELECT 'Usage history records:' as info, COUNT(*) as count FROM parking_usage_history;
