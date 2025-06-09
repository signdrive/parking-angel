-- Get the exact table structure with all details
SELECT 
    column_name,
    data_type,
    udt_name,
    is_nullable,
    column_default,
    character_maximum_length,
    numeric_precision,
    numeric_scale
FROM information_schema.columns 
WHERE table_name = 'parking_spots' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Also get the PostgreSQL specific types
SELECT 
    a.attname as column_name,
    pg_catalog.format_type(a.atttypid, a.atttypmod) as full_data_type,
    a.attnotnull as not_null
FROM pg_catalog.pg_attribute a
JOIN pg_catalog.pg_class c ON a.attrelid = c.oid
JOIN pg_catalog.pg_namespace n ON c.relnamespace = n.oid
WHERE c.relname = 'parking_spots'
AND n.nspname = 'public'
AND a.attnum > 0
AND NOT a.attisdropped
ORDER BY a.attnum;

-- Check a sample row to see actual data types
SELECT 
    id,
    pg_typeof(latitude) as lat_type,
    pg_typeof(longitude) as lng_type,
    pg_typeof(payment_methods) as payment_type,
    pg_typeof(restrictions) as restrictions_type,
    payment_methods,
    restrictions
FROM parking_spots 
LIMIT 1;
