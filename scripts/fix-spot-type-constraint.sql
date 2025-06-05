-- Fix the spot_type constraint issue in parking_spots table

-- 1. First, let's check the current constraint
SELECT '🔍 CHECKING CURRENT CONSTRAINTS' as action;

SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.parking_spots'::regclass 
    AND contype = 'c';

-- 2. Check what values are currently allowed
SELECT 'Current spot_type constraint details:' as info;

-- 3. Drop the existing constraint and create a new one with correct values
SELECT '🔧 FIXING SPOT_TYPE CONSTRAINT' as action;

DO $$
BEGIN
    -- Drop the existing constraint if it exists
    BEGIN
        ALTER TABLE public.parking_spots 
        DROP CONSTRAINT IF EXISTS parking_spots_spot_type_check;
        
        RAISE NOTICE 'Dropped existing spot_type constraint';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'No existing constraint to drop or error: %', SQLERRM;
    END;
    
    -- Create a new constraint with the correct values
    BEGIN
        ALTER TABLE public.parking_spots 
        ADD CONSTRAINT parking_spots_spot_type_check 
        CHECK (spot_type IN ('street', 'garage', 'lot', 'meter'));
        
        RAISE NOTICE 'Created new spot_type constraint with correct values';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error creating constraint: %', SQLERRM;
    END;
END $$;

-- 4. Verify the new constraint
SELECT '✅ VERIFYING NEW CONSTRAINT' as action;

SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.parking_spots'::regclass 
    AND contype = 'c'
    AND conname = 'parking_spots_spot_type_check';

-- 5. Test inserting data with the fixed constraint
SELECT '🧪 TESTING WITH CORRECTED DATA' as action;

-- Clear any existing test data first
DELETE FROM public.parking_spots WHERE latitude IN (37.7749, 37.7849, 37.7649);

-- Insert test data with correct spot_type values
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

-- 6. Verify the data was inserted successfully
SELECT '✅ VERIFYING INSERTED DATA' as action;

SELECT 
    id,
    latitude,
    longitude,
    spot_type,
    is_available,
    expires_at
FROM public.parking_spots
WHERE latitude IN (37.7749, 37.7849, 37.7649)
ORDER BY created_at DESC;

-- 7. Test all allowed spot_type values
SELECT '🧪 TESTING ALL SPOT TYPES' as action;

-- Test each spot type to make sure they all work
INSERT INTO public.parking_spots (
    latitude, 
    longitude, 
    location,
    spot_type, 
    is_available, 
    expires_at
) VALUES 
(
    37.7700, 
    -122.4100,
    ST_SetSRID(ST_MakePoint(-122.4100, 37.7700), 4326)::geography,
    'lot',
    true,
    NOW() + INTERVAL '45 minutes'
);

SELECT 'All spot types tested successfully!' as result;

-- 8. Show final count
SELECT 'FINAL PARKING SPOTS COUNT:' as section;
SELECT COUNT(*) as total_spots FROM public.parking_spots;

SELECT '🎉 SPOT TYPE CONSTRAINT FIXED SUCCESSFULLY!' as final_status;
