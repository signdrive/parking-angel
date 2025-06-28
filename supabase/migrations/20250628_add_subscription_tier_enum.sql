-- Create subscription tier enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE subscription_tier AS ENUM ('free', 'premium', 'pro', 'enterprise');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add check constraint to user_subscriptions
ALTER TABLE user_subscriptions 
    ADD CONSTRAINT valid_plan_id CHECK (plan_id IN ('free', 'premium', 'pro', 'enterprise'));
