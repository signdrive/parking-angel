-- Final verification that everything is working

-- Check all tables exist
SELECT 
    'Table exists: ' || table_name as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check PostGIS is working
SELECT 'PostGIS Version: ' || PostGIS_Version() as status;

-- Check geometry columns are populated
SELECT 
    id,
    latitude,
    longitude,
    CASE 
        WHEN geom IS NOT NULL THEN 'Geometry OK'
        ELSE 'Geometry MISSING'
    END as geom_status
FROM public.parking_spots 
LIMIT 5;

-- Test the nearby spots function
SELECT 'Testing nearby spots function...' as status;
SELECT 
    id,
    latitude,
    longitude,
    distance_meters
FROM public.find_nearby_spots(52.3680, 4.9046, 1000)
LIMIT 5;

-- Check RLS policies
SELECT 
    'RLS Policy: ' || tablename || ' - ' || policyname as status
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check for any remaining references to "location" column
SELECT 
    'Checking for location references...' as status;

-- This should return no results if we've cleaned everything up
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_definition ILIKE '%location%'
AND routine_name NOT LIKE '%geolocation%';

SELECT 'Verification complete!' as final_status;
