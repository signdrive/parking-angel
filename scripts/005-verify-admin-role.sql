-- Check if profile exists and update role
DO $$
DECLARE
    profile_exists boolean;
BEGIN
    -- First check if the profile exists
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE email = 'signdrive@gmail.com'
    ) INTO profile_exists;

    -- Log the result
    RAISE NOTICE 'Profile exists: %', profile_exists;

    -- If profile doesn't exist, we need to find the auth.users entry
    IF NOT profile_exists THEN
        -- Create profile if user exists in auth.users
        INSERT INTO public.profiles (id, email, role)
        SELECT 
            id,
            email,
            'admin' as role
        FROM auth.users
        WHERE email = 'signdrive@gmail.com'
        ON CONFLICT (id) DO UPDATE
        SET role = 'admin';

        RAISE NOTICE 'Created new profile with admin role';
    ELSE
        -- Update existing profile
        UPDATE public.profiles
        SET role = 'admin'
        WHERE email = 'signdrive@gmail.com';
        
        RAISE NOTICE 'Updated existing profile to admin';
    END IF;

    -- Verify the role was set
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE email = 'signdrive@gmail.com' 
        AND role = 'admin'
    ) INTO profile_exists;

    RAISE NOTICE 'Verification - Admin role set: %', profile_exists;
END $$;
