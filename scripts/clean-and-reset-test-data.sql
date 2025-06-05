-- Clean up any problematic data and reset with fresh test data

-- 1. Clean up existing test data
SELECT '🧹 CLEANING UP EXISTING DATA' as action;

-- Remove any test parking spots
DELETE FROM public.parking_spots 
WHERE latitude BETWEEN 37.7 AND 37.8 
    AND longitude BETWEEN -122.5 AND -122.4;

-- Remove test notifications
DELETE FROM public.notifications 
WHERE title LIKE '%Test%' OR title LIKE '%Database%';

-- 2. Show what's left
SELECT '📊 REMAINING DATA' as section;

SELECT 'parking_spots' as table_name, COUNT(*) as remaining_count 
FROM public.parking_spots
UNION ALL
SELECT 'notifications' as table_name, COUNT(*) as remaining_count 
FROM public.notifications;

-- 3. Insert fresh, clean test data
SELECT '✨ INSERTING FRESH TEST DATA' as action;

-- Insert parking spots with only the essential columns
INSERT INTO public.parking_spots (
    latitude, 
    longitude, 
    location,
    spot_type, 
    is_available
) VALUES 
(
    37.7749, 
    -122.4194,
    ST_SetSRID(ST_MakePoint(-122.4194, 37.7749), 4326)::geography,
    'street',
    true
),
(
    37.7849, 
    -122.4094,
    ST_SetSRID(ST_MakePoint(-122.4094, 37.7849), 4326)::geography,
    'garage',
    true
),
(
    37.7649, 
    -122.4294,
    ST_SetSRID(ST_MakePoint(-122.4294, 37.7649), 4326)::geography,
    'lot',
    true
),
(
    37.7550, 
    -122.4394,
    ST_SetSRID(ST_MakePoint(-122.4394, 37.7550), 4326)::geography,
    'meter',
    true
);

-- Insert clean notifications
INSERT INTO public.notifications (
    title,
    message,
    notification_type
) VALUES 
(
    'Welcome to Parking Angel',
    'Your database is now set up and ready to use!',
    'success'
),
(
    'Test Data Loaded',
    'Sample parking spots have been added to help you get started.',
    'info'
);

-- 4. Verify the clean data
SELECT '✅ VERIFYING CLEAN DATA' as section;

SELECT 
    'Parking Spots:' as data_type,
    COUNT(*) as count,
    string_agg(DISTINCT spot_type, ', ') as spot_types
FROM public.parking_spots
UNION ALL
SELECT 
    'Notifications:' as data_type,
    COUNT(*) as count,
    string_agg(DISTINCT notification_type, ', ') as types
FROM public.notifications;

-- 5. Test a simple query
SELECT '🧪 TESTING SIMPLE QUERY' as section;

SELECT 
    spot_type,
    COUNT(*) as count,
    AVG(latitude) as avg_lat,
    AVG(longitude) as avg_lng
FROM public.parking_spots
GROUP BY spot_type
ORDER BY count DESC;

SELECT '🎉 CLEAN DATA SETUP COMPLETE!' as final_status;
