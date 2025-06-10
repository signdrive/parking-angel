-- Fix parking spots table queries and RLS policies
-- This addresses the 406 errors in the console

-- First, check if the table exists and has the right structure
DO $$
BEGIN
    -- Ensure parking_spots table has all required columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'parking_spots' AND column_name = 'latitude') THEN
        ALTER TABLE parking_spots ADD COLUMN latitude DECIMAL(10, 8);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'parking_spots' AND column_name = 'longitude') THEN
        ALTER TABLE parking_spots ADD COLUMN longitude DECIMAL(11, 8);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'parking_spots' AND column_name = 'spot_type') THEN
        ALTER TABLE parking_spots ADD COLUMN spot_type VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'parking_spots' AND column_name = 'address') THEN
        ALTER TABLE parking_spots ADD COLUMN address TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'parking_spots' AND column_name = 'is_available') THEN
        ALTER TABLE parking_spots ADD COLUMN is_available BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'parking_spots' AND column_name = 'last_updated') THEN
        ALTER TABLE parking_spots ADD COLUMN last_updated TIMESTAMP DEFAULT NOW();
    END IF;
END $$;

-- Update RLS policies to be more permissive for read operations
DROP POLICY IF EXISTS "parking_spots_select_policy" ON parking_spots;
CREATE POLICY "parking_spots_select_policy" ON parking_spots
    FOR SELECT USING (true); -- Allow all users to read parking spots

-- Ensure RLS is enabled
ALTER TABLE parking_spots ENABLE ROW LEVEL SECURITY;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_parking_spots_location ON parking_spots(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_parking_spots_type ON parking_spots(spot_type);
CREATE INDEX IF NOT EXISTS idx_parking_spots_available ON parking_spots(is_available);

-- Insert some test data if the table is empty
INSERT INTO parking_spots (id, latitude, longitude, spot_type, address, is_available, last_updated)
SELECT 
    'test_' || generate_series,
    37.7749 + (random() - 0.5) * 0.01,
    -122.4194 + (random() - 0.5) * 0.01,
    CASE (random() * 3)::int
        WHEN 0 THEN 'street'
        WHEN 1 THEN 'garage'
        ELSE 'lot'
    END,
    'Test Address ' || generate_series || ', San Francisco, CA',
    random() > 0.3,
    NOW()
FROM generate_series(1, 10)
WHERE NOT EXISTS (SELECT 1 FROM parking_spots LIMIT 1);

-- Grant necessary permissions
GRANT SELECT ON parking_spots TO anon;
GRANT SELECT ON parking_spots TO authenticated;
