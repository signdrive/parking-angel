-- Set up admin users
-- Replace these emails with actual admin emails

-- Method 1: Set admin flag for existing users by email
UPDATE public.profiles 
SET is_admin = TRUE 
WHERE email IN (
    'admin@parkalgo.com',
    'admin@parkingangel.com',
    'your-admin-email@example.com'  -- Replace with your actual admin email
);

-- Method 2: Create a function to promote user to admin
CREATE OR REPLACE FUNCTION promote_to_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_found BOOLEAN := FALSE;
BEGIN
    UPDATE public.profiles 
    SET is_admin = TRUE 
    WHERE email = user_email;
    
    GET DIAGNOSTICS user_found = FOUND;
    
    IF user_found THEN
        RAISE NOTICE 'User % promoted to admin', user_email;
        RETURN TRUE;
    ELSE
        RAISE NOTICE 'User % not found', user_email;
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Method 3: Create a function to demote admin
CREATE OR REPLACE FUNCTION demote_from_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_found BOOLEAN := FALSE;
BEGIN
    UPDATE public.profiles 
    SET is_admin = FALSE 
    WHERE email = user_email;
    
    GET DIAGNOSTICS user_found = FOUND;
    
    IF user_found THEN
        RAISE NOTICE 'User % demoted from admin', user_email;
        RETURN TRUE;
    ELSE
        RAISE NOTICE 'User % not found', user_email;
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Usage examples:
-- SELECT promote_to_admin('your-email@example.com');
-- SELECT demote_from_admin('user@example.com');

-- View current admin users
SELECT id, email, full_name, is_admin, created_at
FROM public.profiles 
WHERE is_admin = TRUE;
