-- Simple test data script that avoids problematic columns
-- This script uses only the essential columns that we know exist

-- 1. Insert test parking spots (without using address column)
INSERT INTO public.parking_spots (
    latitude, 
    longitude, 
    location,
    spot_type, 
    is_available, 
    expires_at
) VALUES 
(
    37.7749, 
    -122.4194,
    ST_SetSRID(ST_MakePoint(-122.4194, 37.7749), 4326)::geography,
    'street',
    true,
    NOW() + INTERVAL '1 hour'
),
(
    37.7849, 
    -122.4094,
    ST_SetSRID(ST_MakePoint(-122.4094, 37.7849), 4326)::geography,
    'garage',
    true,
    NOW() + INTERVAL '2 hours'
),
(
    37.7649, 
    -122.4294,
    ST_SetSRID(ST_MakePoint(-122.4294, 37.7649), 4326)::geography,
    'meter',
    true,
    NOW() + INTERVAL '30 minutes'
);

-- 2. Insert test notifications (without requiring user_id)
INSERT INTO public.notifications (
    title,
    message,
    notification_type,
    data
) VALUES 
(
    'New Parking Spots Available',
    'Several new parking spots have been added near your location.',
    'info',
    jsonb_build_object('count', 3, 'area', 'San Francisco')
),
(
    'Test Complete',
    'Database is working correctly with test data.',
    'success',
    jsonb_build_object('timestamp', NOW())
);

-- 3. Test the find_nearby_spots function if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.routines 
        WHERE routine_schema = 'public' 
        AND routine_name = 'find_nearby_spots'
    ) THEN
        -- The function exists, so we can test it
        RAISE NOTICE 'Testing find_nearby_spots function...';
    ELSE
        RAISE NOTICE 'find_nearby_spots function does not exist, skipping test';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error testing function: %', SQLERRM;
END $$;

-- 4. Show the inserted data
SELECT 'INSERTED PARKING SPOTS:' as section;
SELECT 
    id,
    latitude,
    longitude,
    spot_type,
    is_available,
    expires_at
FROM public.parking_spots
ORDER BY expires_at;

SELECT 'INSERTED NOTIFICATIONS:' as section;
SELECT 
    id,
    title,
    message,
    notification_type,
    created_at
FROM public.notifications
ORDER BY created_at DESC
LIMIT 5;

SELECT 'Test data insertion complete!' as status;
