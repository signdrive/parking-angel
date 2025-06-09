-- Check the actual structure of parking_spots table
SELECT 
    column_name,
    data_type,
    numeric_precision,
    numeric_scale,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'parking_spots' 
ORDER BY ordinal_position;

-- Also check the actual data types from pg_attribute
SELECT 
    a.attname as column_name,
    pg_catalog.format_type(a.atttypid, a.atttypmod) as data_type
FROM pg_catalog.pg_attribute a
JOIN pg_catalog.pg_class c ON a.attrelid = c.oid
JOIN pg_catalog.pg_namespace n ON c.relnamespace = n.oid
WHERE c.relname = 'parking_spots'
AND n.nspname = 'public'
AND a.attnum > 0
AND NOT a.attisdropped
ORDER BY a.attnum;
