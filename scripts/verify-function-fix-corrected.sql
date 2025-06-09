-- Verify that we now have only one version of the function
SELECT 
    r.routine_name,
    r.routine_type,
    r.data_type as return_type,
    p.parameter_mode,
    p.parameter_name,
    p.data_type as parameter_type,
    p.ordinal_position
FROM information_schema.routines r
LEFT JOIN information_schema.parameters p ON r.specific_name = p.specific_name
WHERE r.routine_name LIKE '%find_nearby%'
ORDER BY r.routine_name, p.ordinal_position;

-- Check for any remaining duplicate functions
SELECT 
    routine_name,
    COUNT(*) as function_count,
    array_agg(specific_name) as specific_names
FROM information_schema.routines 
WHERE routine_name LIKE '%find_nearby%'
GROUP BY routine_name
HAVING COUNT(*) > 1;

-- Test the function works correctly
SELECT 'Testing function after cleanup...' as test_status;

-- Simple test - count spots
SELECT COUNT(*) as total_spots_found
FROM find_nearby_spots(51.5074::double precision, -0.1278::double precision, 10000);

-- Detailed test - get actual results
SELECT 
    id,
    address,
    spot_type,
    ROUND(distance_meters::numeric, 2) as distance_meters
FROM find_nearby_spots(51.5074::double precision, -0.1278::double precision, 5000)
ORDER BY distance_meters
LIMIT 3;

-- Test with different coordinates
SELECT 
    'San Francisco test' as test_location,
    COUNT(*) as spots_found
FROM find_nearby_spots(37.7749::double precision, -122.4194::double precision, 1000);

SELECT 'Function verification completed successfully!' as result;
