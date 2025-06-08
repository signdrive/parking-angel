-- Verify that everything is working correctly

-- Check if tables exist
SELECT 
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Check if PostGIS is working
SELECT PostGIS_Version();

-- Test the geometry function
SELECT 
    id,
    latitude,
    longitude,
    ST_AsText(geom) as geometry_text,
    ST_X(geom::geometry) as geom_longitude,
    ST_Y(geom::geometry) as geom_latitude
FROM public.parking_spots 
LIMIT 3;

-- Test the nearby spots function
SELECT * FROM public.find_nearby_spots(52.3680, 4.9046, 500);

-- Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
