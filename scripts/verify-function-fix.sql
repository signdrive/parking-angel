-- Verify that we now have only one version of the function
SELECT 
    routine_name,
    routine_type,
    data_type,
    parameter_mode,
    parameter_name,
    data_type as parameter_type
FROM information_schema.routines r
LEFT JOIN information_schema.parameters p ON r.specific_name = p.specific_name
WHERE routine_name LIKE '%find_nearby%'
ORDER BY routine_name, ordinal_position;

-- Test the function works correctly
SELECT 'Testing function after cleanup...' as test_status;

-- Simple test
SELECT COUNT(*) as total_spots_found
FROM find_nearby_spots(51.5074::double precision, -0.1278::double precision, 10000);

-- Detailed test
SELECT 
    id,
    address,
    spot_type,
    distance_meters
FROM find_nearby_spots(51.5074::double precision, -0.1278::double precision, 5000)
ORDER BY distance_meters
LIMIT 3;
