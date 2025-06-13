-- Check the actual structure of the parking_spots table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'parking_spots' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Also check if there are any existing functions
SELECT routine_name, routine_definition
FROM information_schema.routines 
WHERE routine_name LIKE '%nearby%' 
AND routine_schema = 'public';
