-- Verification script to check what's missing
-- Run this first to see what needs to be created

SELECT 'PARKING ANGEL DATABASE VERIFICATION' as title;

-- Check extensions
SELECT 'Extensions:' as section;
SELECT 
    extname as extension_name,
    extversion as version
FROM pg_extension 
WHERE extname IN ('postgis', 'uuid-ossp');

-- Check existing tables
SELECT 'Existing Tables:' as section;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Check what tables are missing
SELECT 'Missing Tables:' as section;
SELECT unnest(ARRAY[
    'profiles',
    'parking_spots', 
    'spot_reports',
    'spot_reviews',
    'user_activities',
    'ai_predictions',
    'notifications',
    'fcm_tokens',
    'subscriptions'
]) as expected_table
WHERE unnest(ARRAY[
    'profiles',
    'parking_spots', 
    'spot_reports',
    'spot_reviews',
    'user_activities',
    'ai_predictions',
    'notifications',
    'fcm_tokens',
    'subscriptions'
]) NOT IN (
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
);

-- Check existing functions
SELECT 'Existing Functions:' as section;
SELECT routine_name
FROM information_schema.routines 
WHERE routine_schema = 'public' 
    AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- Check real-time enabled tables
SELECT 'Real-time Enabled Tables:' as section;
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public'
ORDER BY tablename;

-- Show next steps
SELECT 'NEXT STEPS:' as section;
SELECT CASE 
    WHEN (
        SELECT COUNT(*) 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            AND table_name IN ('profiles', 'parking_spots', 'notifications')
    ) < 3 THEN 
        '1. Run scripts/001-fix-missing-tables.sql to create missing tables'
    ELSE 
        '1. ✅ Core tables exist'
END as step_1,
CASE 
    WHEN (
        SELECT COUNT(*) 
        FROM information_schema.routines 
        WHERE routine_schema = 'public' 
            AND routine_name IN ('find_nearby_spots', 'cleanup_expired_spots')
    ) < 2 THEN 
        '2. Run scripts/002-create-functions.sql to create functions'
    ELSE 
        '2. ✅ Functions exist'
END as step_2,
CASE 
    WHEN (
        SELECT COUNT(*) 
        FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
            AND schemaname = 'public'
    ) < 3 THEN 
        '3. Run scripts/003-setup-realtime-fixed.sql to enable real-time'
    ELSE 
        '3. ✅ Real-time enabled'
END as step_3;
