-- Test profiles table access and functionality

-- 1. Check table structure
SELECT 'Checking profiles table structure...' as test;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check RLS policies
SELECT 'Checking RLS policies...' as test;
SELECT policyname, cmd, permissive, qual, with_check
FROM pg_policies 
WHERE tablename = 'profiles' AND schemaname = 'public';

-- 3. Check existing profiles
SELECT 'Checking existing profiles...' as test;
SELECT id, email, full_name, created_at 
FROM public.profiles 
LIMIT 5;

-- 4. Test upsert function
SELECT 'Testing upsert function...' as test;
SELECT public.upsert_profile(
    '0462d759-46bf-4e66-8f4b-43d42d2f30d4'::UUID,
    'test@example.com',
    'Test User',
    'https://example.com/avatar.jpg'
);

-- 5. Verify the test profile was created/updated
SELECT 'Verifying test profile...' as test;
SELECT * FROM public.profiles 
WHERE id = '0462d759-46bf-4e66-8f4b-43d42d2f30d4';

-- 6. Check permissions
SELECT 'Checking table permissions...' as test;
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'profiles' AND table_schema = 'public';

SELECT 'Profiles access test complete!' as final_status;
