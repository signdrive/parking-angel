-- Fix profile issues that might be causing authentication problems

-- 1. Check if profiles table exists and has the right structure
SELECT '🔍 CHECKING PROFILES TABLE' as action;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 2. Check for users without profiles
SELECT '🔍 CHECKING FOR USERS WITHOUT PROFILES' as action;

WITH auth_users AS (
    SELECT id, email FROM auth.users
)
SELECT 
    au.id as user_id,
    au.email as user_email,
    'Missing profile' as issue
FROM auth_users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- 3. Fix missing profiles by creating them
SELECT '🔧 FIXING MISSING PROFILES' as action;

DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN 
        WITH auth_users AS (
            SELECT id, email, raw_user_meta_data FROM auth.users
        )
        SELECT 
            au.id as user_id,
            au.email as user_email,
            au.raw_user_meta_data
        FROM auth_users au
        LEFT JOIN public.profiles p ON au.id = p.id
        WHERE p.id IS NULL
    LOOP
        -- Create missing profile
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
            user_record.user_id,
            user_record.user_email,
            COALESCE(
                user_record.raw_user_meta_data->>'full_name', 
                user_record.raw_user_meta_data->>'name',
                'User'
            ),
            COALESCE(
                user_record.raw_user_meta_data->>'avatar_url',
                user_record.raw_user_meta_data->>'picture',
                NULL
            ),
            100, -- default reputation score
            0,   -- default total reports
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Created missing profile for user %', user_record.user_email;
    END LOOP;
END $$;

-- 4. Check for incomplete profiles
SELECT '🔍 CHECKING FOR INCOMPLETE PROFILES' as action;

SELECT 
    id,
    email,
    full_name,
    CASE 
        WHEN reputation_score IS NULL THEN 'Missing reputation_score'
        WHEN total_reports IS NULL THEN 'Missing total_reports'
        ELSE NULL
    END as issue
FROM public.profiles
WHERE reputation_score IS NULL OR total_reports IS NULL;

-- 5. Fix incomplete profiles
SELECT '🔧 FIXING INCOMPLETE PROFILES' as action;

UPDATE public.profiles
SET 
    reputation_score = COALESCE(reputation_score, 100),
    total_reports = COALESCE(total_reports, 0),
    updated_at = NOW()
WHERE reputation_score IS NULL OR total_reports IS NULL;

-- 6. Verify profiles are now complete
SELECT '✅ VERIFYING PROFILES' as action;

SELECT 
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN reputation_score IS NOT NULL AND total_reports IS NOT NULL THEN 1 END) as complete_profiles
FROM public.profiles;

-- 7. Check RLS policies
SELECT '🔍 CHECKING RLS POLICIES' as action;

SELECT 
    tablename,
    policyname,
    permissive,
    cmd
FROM pg_policies 
WHERE schemaname = 'public'
    AND tablename = 'profiles';

-- 8. Fix RLS policies if needed
SELECT '🔧 FIXING RLS POLICIES' as action;

DO $$
BEGIN
    -- Ensure public profiles are viewable
    IF NOT EXISTS (
        SELECT FROM pg_policies 
        WHERE schemaname = 'public' 
            AND tablename = 'profiles' 
            AND policyname = 'Public profiles are viewable by everyone'
    ) THEN
        CREATE POLICY "Public profiles are viewable by everyone" 
        ON public.profiles 
        FOR SELECT 
        USING (true);
        
        RAISE NOTICE 'Created missing SELECT policy for profiles';
    END IF;
    
    -- Ensure users can update own profile
    IF NOT EXISTS (
        SELECT FROM pg_policies 
        WHERE schemaname = 'public' 
            AND tablename = 'profiles' 
            AND policyname = 'Users can update own profile'
    ) THEN
        CREATE POLICY "Users can update own profile" 
        ON public.profiles 
        FOR UPDATE 
        USING (auth.uid() = id);
        
        RAISE NOTICE 'Created missing UPDATE policy for profiles';
    END IF;
    
    -- Ensure users can insert own profile
    IF NOT EXISTS (
        SELECT FROM pg_policies 
        WHERE schemaname = 'public' 
            AND tablename = 'profiles' 
            AND policyname = 'Users can insert own profile'
    ) THEN
        CREATE POLICY "Users can insert own profile" 
        ON public.profiles 
        FOR INSERT 
        WITH CHECK (auth.uid() = id);
        
        RAISE NOTICE 'Created missing INSERT policy for profiles';
    END IF;
END $$;

-- 9. Final verification
SELECT '✅ PROFILE FIXES COMPLETE' as action;

SELECT 
    'Profiles table is now properly configured with ' || COUNT(*) || ' profiles' as result
FROM public.profiles;
