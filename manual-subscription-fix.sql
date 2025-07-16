-- ============================================================================
-- SIMPLIFIED SCRIPT - ASSUMES YOU MANUALLY DROPPED THE TABLES
-- Run this AFTER you manually drop user_subscriptions table
-- ============================================================================

-- 0. MANUALLY DROP THESE TABLES FIRST IN SUPABASE:
-- DROP TABLE user_subscriptions CASCADE;
-- DROP TABLE profiles CASCADE; (if you want to recreate it too)

-- ============================================================================
-- 1. CREATE NEW ENUM TYPES
-- ============================================================================

-- Drop old enum types if they exist
DROP TYPE IF EXISTS subscription_plan_type CASCADE;
DROP TYPE IF EXISTS subscription_status_type CASCADE;

-- Create new enum types with correct values
CREATE TYPE subscription_plan_type AS ENUM (
    'free',
    'navigator',
    'pro_parker', 
    'fleet_manager'
);

CREATE TYPE subscription_status_type AS ENUM (
    'active',
    'canceled',
    'incomplete',
    'incomplete_expired',
    'past_due',
    'trialing',
    'unpaid'
);

-- ============================================================================
-- 2. CREATE NEW USER_SUBSCRIPTIONS TABLE
-- ============================================================================

CREATE TABLE user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT UNIQUE,
    plan_id subscription_plan_type NOT NULL DEFAULT 'free',
    status subscription_status_type NOT NULL DEFAULT 'incomplete',
    amount DECIMAL(10,2) DEFAULT 0.00,
    trial_end TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    email TEXT,
    
    -- Add proper constraints
    CONSTRAINT unique_user_subscription UNIQUE (user_id),
    CONSTRAINT valid_amount CHECK (amount >= 0),
    CONSTRAINT valid_plan_pricing CHECK (
        (plan_id = 'free' AND amount = 0) OR
        (plan_id = 'navigator' AND amount = 9.90) OR
        (plan_id = 'pro_parker' AND amount = 19.90) OR
        (plan_id = 'fleet_manager' AND amount = 49.90)
    )
);

-- ============================================================================
-- 3. UPDATE PROFILES TABLE (if it still exists)
-- ============================================================================

-- If profiles table still exists, update it to remove the problematic constraint
DO $$
BEGIN
    -- Check if profiles table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        -- Drop the problematic constraint
        ALTER TABLE profiles DROP CONSTRAINT IF EXISTS valid_subscription_plan;
        
        -- Convert subscription columns to text temporarily
        ALTER TABLE profiles ALTER COLUMN subscription_plan TYPE TEXT;
        ALTER TABLE profiles ALTER COLUMN subscription_tier TYPE TEXT;
        
        -- Update the data
        UPDATE profiles 
        SET subscription_plan = 'navigator', subscription_tier = 'navigator'
        WHERE subscription_plan = 'premium';
        
        UPDATE profiles 
        SET subscription_plan = 'pro_parker', subscription_tier = 'pro_parker'
        WHERE subscription_plan = 'pro';
        
        UPDATE profiles 
        SET subscription_plan = 'fleet_manager', subscription_tier = 'fleet_manager'
        WHERE subscription_plan = 'enterprise';
        
        -- Convert back to enum (this will fail if enum doesn't exist, so we skip it)
        -- ALTER TABLE profiles ALTER COLUMN subscription_plan TYPE subscription_plan_type USING subscription_plan::subscription_plan_type;
        -- ALTER TABLE profiles ALTER COLUMN subscription_tier TYPE subscription_plan_type USING subscription_tier::subscription_plan_type;
        
    END IF;
END $$;

-- ============================================================================
-- 4. INSERT YOUR CURRENT SUBSCRIPTION DATA
-- ============================================================================

-- Insert your current subscription manually with correct values
INSERT INTO user_subscriptions (
    user_id,
    stripe_customer_id,
    stripe_subscription_id,
    plan_id,
    status,
    amount,
    created_at,
    updated_at,
    email
) VALUES (
    '32603d29-bb77-4be9-aa9a-bad5a699b6e8',
    'cus_Sgcg1TnCeXnGcj',
    'sub_1RlFRdKFfjGfLUIXnDq5Ir7u',
    'navigator',
    'active',
    9.90,
    '2025-07-15 20:27:23.992646+00',
    NOW(),
    'imchichi.depuydt@gmail.com'
);

-- Update profiles table to match
UPDATE profiles 
SET 
    subscription_plan = 'navigator',
    subscription_tier = 'navigator',
    subscription_status = 'active',
    updated_at = NOW()
WHERE id = '32603d29-bb77-4be9-aa9a-bad5a699b6e8';

-- ============================================================================
-- 5. ENABLE ROW LEVEL SECURITY AND SET POLICIES
-- ============================================================================

-- Enable RLS on the new table
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy for users to see their own subscription
CREATE POLICY "Users can view own subscription" 
ON user_subscriptions FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Policy for users to update their own subscription
CREATE POLICY "Users can update own subscription" 
ON user_subscriptions FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

-- Policy for service role to manage all subscriptions
CREATE POLICY "Service role can manage all subscriptions"
ON user_subscriptions FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================================================
-- 6. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_stripe_customer ON user_subscriptions(stripe_customer_id);
CREATE INDEX idx_user_subscriptions_stripe_subscription ON user_subscriptions(stripe_subscription_id);
CREATE INDEX idx_user_subscriptions_plan_status ON user_subscriptions(plan_id, status);
CREATE INDEX idx_user_subscriptions_created_at ON user_subscriptions(created_at);

-- ============================================================================
-- 7. CREATE TRIGGER FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_subscriptions_updated_at 
    BEFORE UPDATE ON user_subscriptions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- END OF COMMANDS
-- ============================================================================
