-- Enable RLS on user_subscriptions table
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow the service role to bypass RLS
ALTER TABLE user_subscriptions FORCE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Grant all permissions to the service role
GRANT ALL ON user_subscriptions TO service_role;
GRANT USAGE ON SEQUENCE user_subscriptions_id_seq TO service_role;

-- Create policy for authenticated users to view their own subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON user_subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
