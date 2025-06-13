-- Check all constraints in the database to identify potential issues

-- 1. Check all table constraints
SELECT '🔍 ALL TABLE CONSTRAINTS' as section;

SELECT 
    t.table_name,
    c.constraint_name,
    c.constraint_type,
    pg_get_constraintdef(pgc.oid) as constraint_definition
FROM information_schema.table_constraints c
JOIN information_schema.tables t ON c.table_name = t.table_name
JOIN pg_constraint pgc ON pgc.conname = c.constraint_name
WHERE t.table_schema = 'public'
    AND c.constraint_type = 'CHECK'
ORDER BY t.table_name, c.constraint_name;

-- 2. Check specifically for spot_type related constraints
SELECT '🔍 SPOT_TYPE CONSTRAINTS' as section;

SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.parking_spots'::regclass 
    AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%spot_type%';

-- 3. Check for any other enum-like constraints
SELECT '🔍 OTHER CHECK CONSTRAINTS' as section;

SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
    AND tablename = 'parking_spots';

-- 4. Show current parking_spots table structure
SELECT '📋 PARKING_SPOTS TABLE STRUCTURE' as section;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'parking_spots'
ORDER BY ordinal_position;

-- 5. Test what values are currently in spot_type column
SELECT '📊 CURRENT SPOT_TYPE VALUES' as section;

SELECT 
    spot_type,
    COUNT(*) as count
FROM public.parking_spots
GROUP BY spot_type
ORDER BY count DESC;
