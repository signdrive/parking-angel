-- Quick test to check profile access
-- User ID: 0462d759-46bf-4e66-8f4b-43d42d2f30d4

-- Step 1: Check if profile exists
SELECT 
    'Profile exists check:' as test,
    COUNT(*) as profile_count
FROM public.profiles 
WHERE id = '0462d759-46bf-4e66-8f4b-43d42d2f30d4';

-- Step 2: Get profile data
SELECT 
    'Profile data:' as test,
    id,
    email,
    full_name,
    reputation_score,
    total_reports,
    created_at
FROM public.profiles 
WHERE id = '0462d759-46bf-4e66-8f4b-43d42d2f30d4';

-- Step 3: Check RLS status
SELECT 
    'RLS status:' as test,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'profiles' 
AND schemaname = 'public';

-- Step 4: Temporarily disable RLS to test if that's the issue
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

SELECT 'RLS disabled - testing access:' as test;

SELECT 
    id,
    email,
    full_name,
    'Should work now!' as status
FROM public.profiles 
WHERE id = '0462d759-46bf-4e66-8f4b-43d42d2f30d4';

-- Step 5: Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

SELECT 'RLS re-enabled' as final_status;
