-- Simple test to verify the function works
SELECT 'Testing find_nearby_spots function...' as status;

-- Test 1: Basic functionality
SELECT 
    'Test 1: Basic function call' as test_name,
    COUNT(*) as result
FROM find_nearby_spots(51.5074::double precision, -0.1278::double precision, 1000);

-- Test 2: Check return structure
SELECT 
    'Test 2: Function return structure' as test_name,
    id,
    latitude,
    longitude,
    spot_type,
    distance_meters
FROM find_nearby_spots(51.5074::double precision, -0.1278::double precision, 5000)
LIMIT 1;

-- Test 3: Verify no duplicate functions exist
SELECT 
    'Test 3: Function uniqueness check' as test_name,
    routine_name,
    COUNT(*) as count
FROM information_schema.routines 
WHERE routine_name = 'find_nearby_spots'
GROUP BY routine_name;

SELECT 'All tests completed!' as final_status;
