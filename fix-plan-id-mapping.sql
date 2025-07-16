-- Fix plan ID mapping for subscription display
-- Update existing subscriptions to use correct plan IDs that match frontend config

-- Update user_subscriptions table
UPDATE user_subscriptions 
SET plan_id = 'navigator' 
WHERE plan_id = 'premium';

UPDATE user_subscriptions 
SET plan_id = 'pro_parker' 
WHERE plan_id = 'pro';

UPDATE user_subscriptions 
SET plan_id = 'fleet_manager' 
WHERE plan_id = 'enterprise';

-- Update profiles table
UPDATE profiles 
SET subscription_plan = 'navigator',
    subscription_tier = 'navigator'
WHERE subscription_plan = 'premium';

UPDATE profiles 
SET subscription_plan = 'pro_parker',
    subscription_tier = 'pro_parker'
WHERE subscription_plan = 'pro';

UPDATE profiles 
SET subscription_plan = 'fleet_manager',
    subscription_tier = 'fleet_manager'
WHERE subscription_plan = 'enterprise';

-- Update subscription_events table
UPDATE subscription_events 
SET tier = 'navigator' 
WHERE tier = 'premium';

UPDATE subscription_events 
SET tier = 'pro_parker' 
WHERE tier = 'pro';

UPDATE subscription_events 
SET tier = 'fleet_manager' 
WHERE tier = 'enterprise';

-- Verify the changes
SELECT 'user_subscriptions' as table_name, plan_id, count(*) as count
FROM user_subscriptions 
GROUP BY plan_id
UNION ALL
SELECT 'profiles' as table_name, subscription_plan, count(*) as count
FROM profiles 
GROUP BY subscription_plan
UNION ALL
SELECT 'subscription_events' as table_name, tier, count(*) as count
FROM subscription_events 
GROUP BY tier;
