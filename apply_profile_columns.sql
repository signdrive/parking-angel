-- This script can be run directly against the database to update the profiles table
-- Add subscription_tier and status columns to profiles table

-- Create subscription_tier enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE public.subscription_tier AS ENUM ('free', 'premium', 'pro', 'enterprise');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add subscription_tier column to profiles table if it doesn't exist
DO $$ BEGIN
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_tier subscription_tier DEFAULT 'free'::subscription_tier NOT NULL;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Add subscription_status column if it doesn't exist
DO $$ BEGIN
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'inactive' NOT NULL;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Add stripe_customer_id column if it doesn't exist
DO $$ BEGIN
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_customer_id text;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Update any 'navigator' values to 'premium' if they exist
UPDATE public.profiles 
SET subscription_tier = 'premium'::subscription_tier 
WHERE subscription_tier::text = 'navigator';

-- Update any 'pro_parker' values to 'pro' if they exist
UPDATE public.profiles 
SET subscription_tier = 'pro'::subscription_tier 
WHERE subscription_tier::text = 'pro_parker';

-- Update any 'fleet_manager' values to 'enterprise' if they exist
UPDATE public.profiles 
SET subscription_tier = 'enterprise'::subscription_tier 
WHERE subscription_tier::text = 'fleet_manager';
