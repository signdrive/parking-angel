-- Verify database setup and test functionality

-- 1. Check all tables were created
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. Check all functions were created
SELECT 
    routine_name,
    routine_type,
    data_type as return_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
    AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- 3. Check indexes were created
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 4. Check RLS policies
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 5. Test the find_nearby_spots function
SELECT 'Testing find_nearby_spots function...' as test_status;

-- Test with San Francisco coordinates
SELECT * FROM find_nearby_spots(37.7749, -122.4194, 1000);

-- 6. Test the calculate_parking_demand function
SELECT 'Testing calculate_parking_demand function...' as test_status;

SELECT * FROM calculate_parking_demand(37.7749, -122.4194, 1000);

-- 7. Check if extensions are enabled
SELECT 
    extname as extension_name,
    extversion as version
FROM pg_extension 
WHERE extname IN ('postgis', 'uuid-ossp');

-- 8. Test AI predictions table
SELECT 'Testing AI predictions...' as test_status;

SELECT 
    id,
    prediction_type,
    confidence_score,
    valid_until > NOW() as is_valid
FROM public.ai_predictions
LIMIT 5;

-- 9. Check table row counts
SELECT 
    'profiles' as table_name, COUNT(*) as row_count FROM public.profiles
UNION ALL
SELECT 
    'parking_spots' as table_name, COUNT(*) as row_count FROM public.parking_spots
UNION ALL
SELECT 
    'spot_reports' as table_name, COUNT(*) as row_count FROM public.spot_reports
UNION ALL
SELECT 
    'ai_predictions' as table_name, COUNT(*) as row_count FROM public.ai_predictions
UNION ALL
SELECT 
    'notifications' as table_name, COUNT(*) as row_count FROM public.notifications;

-- 10. Test cleanup function
SELECT 'Testing cleanup function...' as test_status;

SELECT cleanup_expired_spots() as deleted_spots_count;
