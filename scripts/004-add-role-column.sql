-- Add role column to profiles table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'role'
    ) THEN
        -- Add role column with default value 'user'
        ALTER TABLE public.profiles
        ADD COLUMN role TEXT DEFAULT 'user';
        
        -- Create index for faster role lookups
        CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
        
        RAISE NOTICE 'Added role column to profiles table';
    ELSE
        RAISE NOTICE 'role column already exists in profiles table';
    END IF;    -- Set admin role for existing admin users
    UPDATE public.profiles
    SET role = 'admin'
    WHERE email IN ('admin@parkalgo.com', 'admin@parking-angel.com', 'signdrive@gmail.com');
    
    -- Create policy for admin access
    DROP POLICY IF EXISTS "Admin users have full access" ON public.profiles;
    CREATE POLICY "Admin users have full access" 
    ON public.profiles 
    USING (
        (role = 'admin' AND auth.uid() = id) OR
        (auth.uid() = id)
    );
END $$;
