-- Fix the specific user profile that's causing the authentication issue
-- User ID: 0462d759-46bf-4e66-8f4b-43d42d2f30d4
-- Email: signdrive@gmail.com

-- 1. Check if the user exists in auth.users
SELECT '🔍 CHECKING USER IN AUTH.USERS' as action;

SELECT 
    id,
    email,
    created_at,
    raw_user_meta_data
FROM auth.users 
WHERE id = '0462d759-46bf-4e66-8f4b-43d42d2f30d4';

-- 2. Check if profile exists
SELECT '🔍 CHECKING EXISTING PROFILE' as action;

SELECT * FROM public.profiles 
WHERE id = '0462d759-46bf-4e66-8f4b-43d42d2f30d4';

-- 3. Create the missing profile
SELECT '🔧 CREATING MISSING PROFILE' as action;

INSERT INTO public.profiles (
    id,
    email,
    full_name,
    avatar_url,
    reputation_score,
    total_reports,
    created_at,
    updated_at
) VALUES (
    '0462d759-46bf-4e66-8f4b-43d42d2f30d4',
    'signdrive@gmail.com',
    'User', -- Default name, can be updated later
    NULL,   -- No avatar initially
    100,    -- Default reputation score
    0,      -- Default total reports
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();

-- 4. Verify the profile was created
SELECT '✅ VERIFYING PROFILE CREATION' as action;

SELECT 
    id,
    email,
    full_name,
    reputation_score,
    total_reports,
    created_at
FROM public.profiles 
WHERE id = '0462d759-46bf-4e66-8f4b-43d42d2f30d4';

-- 5. Check if there are any other users without profiles
SELECT '🔍 CHECKING FOR OTHER USERS WITHOUT PROFILES' as action;

WITH auth_users AS (
    SELECT id, email FROM auth.users
)
SELECT 
    au.id as user_id,
    au.email as user_email,
    'Missing profile' as status
FROM auth_users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

SELECT '🎉 PROFILE FIX COMPLETE!' as final_status;
