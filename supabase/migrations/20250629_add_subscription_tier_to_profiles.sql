-- Add subscription_tier column to profiles table if it doesn't exist
DO $$ BEGIN
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_tier subscription_tier DEFAULT 'free' NOT NULL;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Add subscription_status column if it doesn't exist
DO $$ BEGIN
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'inactive' NOT NULL;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Add stripe_customer_id column if it doesn't exist
DO $$ BEGIN
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id text;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;
