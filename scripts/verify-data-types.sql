-- Verify the exact data types and sample data
SELECT 
    'Column Information' as info_type,
    column_name,
    data_type,
    udt_name,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'parking_spots' 
AND column_name IN ('payment_methods', 'restrictions', 'latitude', 'longitude')
ORDER BY column_name;

-- Check actual data
SELECT 
    'Sample Data' as info_type,
    id,
    latitude,
    longitude,
    payment_methods,
    restrictions,
    pg_typeof(payment_methods) as payment_type,
    pg_typeof(restrictions) as restrictions_type
FROM parking_spots 
LIMIT 3;

-- Test array handling
SELECT 
    'Array Test' as info_type,
    id,
    payment_methods,
    CASE 
        WHEN payment_methods IS NULL THEN 'NULL'
        WHEN array_length(payment_methods, 1) IS NULL THEN 'EMPTY_ARRAY'
        ELSE 'HAS_DATA'
    END as array_status
FROM parking_spots 
LIMIT 5;
