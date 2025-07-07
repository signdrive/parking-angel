-- Create a function to safely delete all user data in a transaction
CREATE OR REPLACE FUNCTION delete_user_data(user_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete everything in a transaction
  DELETE FROM user_subscriptions WHERE user_id = user_id_param;
  DELETE FROM profiles WHERE id = user_id_param;
  
  -- Add any other tables that have user data here
  
  -- Note: Auth user deletion must still be done through the auth.users API
END;
$$;
