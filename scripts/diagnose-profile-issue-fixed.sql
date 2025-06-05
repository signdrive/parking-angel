-- Comprehensive diagnosis of the profile issue (Fixed version)
-- User ID: 0462d759-46bf-4e66-8f4b-43d42d2f30d4

SELECT '🔍 STEP 1: CHECK AUTH USER' as step;

-- Check the auth.users table (only existing columns)
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data
FROM auth.users 
WHERE id = '0462d759-46bf-4e66-8f4b-43d42d2f30d4';

SELECT '🔍 STEP 2: CHECK PROFILE DATA' as step;

-- Check the profiles table
SELECT 
    id,
    email,
    full_name,
    avatar_url,
    reputation_score,
    total_reports,
    created_at,
    updated_at
FROM public.profiles 
WHERE id = '0462d759-46bf-4e66-8f4b-43d42d2f30d4';

SELECT '🔍 STEP 3: CHECK FOR DATA TYPE ISSUES' as step;

-- Check if there are any data type or constraint issues
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT '🔍 STEP 4: CHECK RLS POLICIES' as step;

-- Check Row Level Security policies that might be blocking access
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles';

SELECT '🔍 STEP 5: CHECK RLS STATUS' as step;

-- Check if RLS is enabled on the profiles table
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles' 
AND schemaname = 'public';

SELECT '🔍 STEP 6: TEST PROFILE QUERY AS AUTHENTICATED USER' as step;

-- This simulates what the app is trying to do
-- Note: This might fail if RLS is blocking it
SELECT 
    'Attempting to select profile...' as action,
    id,
    email,
    full_name
FROM public.profiles 
WHERE id = '0462d759-46bf-4e66-8f4b-43d42d2f30d4';

SELECT '🔍 STEP 7: CHECK FOR CORRUPTED DATA' as step;

-- Check if there are any NULL or invalid values
SELECT 
    id,
    email,
    full_name,
    CASE 
        WHEN id IS NULL THEN 'ID is NULL'
        WHEN email IS NULL THEN 'Email is NULL'
        WHEN created_at IS NULL THEN 'Created_at is NULL'
        ELSE 'Data looks OK'
    END as data_status,
    created_at,
    updated_at
FROM public.profiles 
WHERE id = '0462d759-46bf-4e66-8f4b-43d42d2f30d4';

SELECT '🔍 STEP 8: CHECK ALL PROFILES (to see if issue is specific to this user)' as step;

-- Check if other profiles exist and work
SELECT 
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN email IS NOT NULL THEN 1 END) as profiles_with_email,
    COUNT(CASE WHEN full_name IS NOT NULL THEN 1 END) as profiles_with_name
FROM public.profiles;

SELECT '🔧 STEP 9: FIX POTENTIAL ISSUES' as step;

-- Update the profile to ensure all required fields are properly set
UPDATE public.profiles 
SET 
    email = COALESCE(email, 'signdrive@gmail.com'),
    full_name = COALESCE(full_name, 'User'),
    reputation_score = COALESCE(reputation_score, 100),
    total_reports = COALESCE(total_reports, 0),
    updated_at = NOW()
WHERE id = '0462d759-46bf-4e66-8f4b-43d42d2f30d4';

SELECT '🔧 STEP 10: DISABLE RLS TEMPORARILY (if needed)' as step;

-- If RLS is causing issues, we can temporarily disable it
-- Uncomment the next line if RLS is blocking access:
-- ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

SELECT '✅ STEP 11: VERIFY FIX' as step;

-- Final verification
SELECT 
    id,
    email,
    full_name,
    avatar_url,
    reputation_score,
    total_reports,
    created_at,
    updated_at,
    'Profile should now work!' as status
FROM public.profiles 
WHERE id = '0462d759-46bf-4e66-8f4b-43d42d2f30d4';

SELECT '🔍 STEP 12: CHECK AUTH SCHEMA COLUMNS' as step;

-- Let's see what columns actually exist in auth.users
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'auth'
ORDER BY ordinal_position;

SELECT '🎉 DIAGNOSIS COMPLETE!' as final_status;
