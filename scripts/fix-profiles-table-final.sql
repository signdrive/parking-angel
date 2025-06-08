-- Fix profiles table and RLS policies once and for all

-- 1. Drop and recreate profiles table with proper structure
DROP TABLE IF EXISTS public.profiles CASCADE;

CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    reputation_score INTEGER DEFAULT 100,
    total_reports INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Drop any existing policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON public.profiles;

-- 4. Create ultra-permissive policies
CREATE POLICY "Enable read access for all users" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for users based on id" ON public.profiles
    FOR UPDATE USING (auth.uid() = id OR auth.uid() IS NOT NULL);

-- 5. Create or update profile function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'User'),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Create profiles for existing users who don't have them
INSERT INTO public.profiles (id, email, full_name, avatar_url, reputation_score, total_reports)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', 'User'),
    COALESCE(au.raw_user_meta_data->>'avatar_url', au.raw_user_meta_data->>'picture'),
    100,
    0
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- 8. Create upsert function for profiles
CREATE OR REPLACE FUNCTION public.upsert_profile(
    user_id UUID,
    user_email TEXT DEFAULT NULL,
    user_full_name TEXT DEFAULT NULL,
    user_avatar_url TEXT DEFAULT NULL
)
RETURNS public.profiles AS $$
DECLARE
    result public.profiles;
BEGIN
    -- Try to update first
    UPDATE public.profiles 
    SET 
        email = COALESCE(user_email, email),
        full_name = COALESCE(user_full_name, full_name),
        avatar_url = COALESCE(user_avatar_url, avatar_url),
        updated_at = NOW()
    WHERE id = user_id
    RETURNING * INTO result;
    
    -- If no rows were updated, insert
    IF NOT FOUND THEN
        INSERT INTO public.profiles (id, email, full_name, avatar_url)
        VALUES (user_id, user_email, user_full_name, user_avatar_url)
        RETURNING * INTO result;
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Grant necessary permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO anon;
GRANT EXECUTE ON FUNCTION public.upsert_profile TO authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_profile TO anon;

-- 10. Verify the setup
SELECT 'Profiles table setup complete!' as status;
SELECT COUNT(*) as total_profiles FROM public.profiles;
