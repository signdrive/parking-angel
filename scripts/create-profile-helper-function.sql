-- Create a helper function to get user profiles
-- This can help bypass potential RLS issues during debugging

CREATE OR REPLACE FUNCTION get_user_profile(user_id UUID)
RETURNS TABLE (
    id UUID,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    reputation_score INTEGER,
    total_reports INTEGER,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) 
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.email,
        p.full_name,
        p.avatar_url,
        p.reputation_score,
        p.total_reports,
        p.created_at,
        p.updated_at
    FROM public.profiles p
    WHERE p.id = user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_profile(UUID) TO authenticated;

-- Test the function with your user ID
SELECT '🧪 TESTING PROFILE FUNCTION' as test;

SELECT * FROM get_user_profile('0462d759-46bf-4e66-8f4b-43d42d2f30d4');
