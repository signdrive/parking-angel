-- Verify that the parking tables are working correctly

-- Check table structure
\echo 'Checking parking_spots table structure:'
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'parking_spots' 
ORDER BY ordinal_position;

\echo 'Checking parking_usage_history table structure:'
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'parking_usage_history' 
ORDER BY ordinal_position;

-- Check data
\echo 'Sample parking spots data:'
SELECT id, latitude, longitude, spot_type, address, is_available 
FROM parking_spots 
LIMIT 5;

\echo 'Sample usage history data:'
SELECT spot_id, action, timestamp 
FROM parking_usage_history 
LIMIT 5;

-- Test the queries that were failing
\echo 'Testing problematic queries:'

-- Test query 1: Get parking spot details
SELECT latitude, longitude, spot_type, address 
FROM parking_spots 
WHERE id = 'google_ChIJAZFO6X9Rw0cRPMnHnH_dm54';

-- Test query 2: Get availability status
SELECT is_available, last_updated 
FROM parking_spots 
WHERE id = 'google_ChIJAZFO6X9Rw0cRPMnHnH_dm54';

-- Test query 3: Get usage history
SELECT * 
FROM parking_usage_history 
WHERE spot_id = 'google_ChIJAZFO6X9Rw0cRPMnHnH_dm54' 
AND timestamp >= NOW() - INTERVAL '1 day'
ORDER BY timestamp DESC;

-- Check RLS policies
\echo 'Checking RLS policies:'
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('parking_spots', 'parking_usage_history');
