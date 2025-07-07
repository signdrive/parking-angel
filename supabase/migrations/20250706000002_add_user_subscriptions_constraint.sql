-- Add unique constraint to user_subscriptions table
ALTER TABLE user_subscriptions 
  ADD CONSTRAINT user_subscriptions_user_id_key UNIQUE (user_id);

-- Add indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_subscription_id 
  ON user_subscriptions (stripe_subscription_id);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status 
  ON user_subscriptions (status);
