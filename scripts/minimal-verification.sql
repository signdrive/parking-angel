-- Minimal verification script that checks only what we know exists
-- This script avoids any references to potentially missing columns or tables

-- 1. Check what tables exist
SELECT 'EXISTING TABLES:' as section;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. Check what columns exist in profiles
SELECT 'PROFILES TABLE STRUCTURE:' as section;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 3. Check what columns exist in parking_spots
SELECT 'PARKING_SPOTS TABLE STRUCTURE:' as section;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'parking_spots'
ORDER BY ordinal_position;

-- 4. Check what functions exist
SELECT 'EXISTING FUNCTIONS:' as section;
SELECT routine_name
FROM information_schema.routines 
WHERE routine_schema = 'public' 
    AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- 5. Check real-time enabled tables
SELECT 'REAL-TIME ENABLED TABLES:' as section;
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public'
ORDER BY tablename;

-- 6. Check if PostGIS is enabled
SELECT 'POSTGIS STATUS:' as section;
SELECT 
    extname as extension_name,
    extversion as version
FROM pg_extension 
WHERE extname = 'postgis';

-- 7. Check if uuid-ossp is enabled
SELECT 'UUID-OSSP STATUS:' as section;
SELECT 
    extname as extension_name,
    extversion as version
FROM pg_extension 
WHERE extname = 'uuid-ossp';

-- 8. Count records in main tables
SELECT 'TABLE RECORD COUNTS:' as section;
SELECT 'profiles' as table_name, COUNT(*) as record_count FROM public.profiles
UNION ALL
SELECT 'parking_spots' as table_name, COUNT(*) as record_count FROM public.parking_spots
UNION ALL
SELECT 'notifications' as table_name, COUNT(*) as record_count FROM public.notifications;

-- 9. Final status
SELECT 'VERIFICATION COMPLETE' as section;
SELECT 'Database structure has been verified.' as message;
