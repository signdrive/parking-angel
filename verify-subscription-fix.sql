-- ============================================================================
-- VERIFICATION SCRIPT - CHECK IF SUBSCRIPTION FIX WORKED
-- Run this to verify your subscription is displaying correctly
-- ============================================================================

-- 1. Check the user_subscriptions table structure and data
SELECT 
    'USER_SUBSCRIPTIONS' as table_name,
    us.id,
    us.user_id,
    us.plan_id,
    us.status,
    us.amount,
    us.stripe_customer_id,
    us.stripe_subscription_id,
    us.email,
    us.created_at,
    us.updated_at
FROM user_subscriptions us
ORDER BY us.updated_at DESC;

-- 2. Check the profiles table subscription data
SELECT 
    'PROFILES' as table_name,
    p.id,
    p.email,
    p.subscription_plan,
    p.subscription_status,
    p.subscription_tier,
    p.updated_at
FROM profiles p
WHERE p.subscription_plan != 'free' OR p.subscription_plan IS NULL
ORDER BY p.updated_at DESC;

-- 3. Check if both tables match for your user
SELECT 
    'COMBINED_VIEW' as view_type,
    p.email,
    p.subscription_plan as profile_plan,
    p.subscription_status as profile_status,
    us.plan_id as subscription_plan_id,
    us.status as subscription_status,
    us.amount as monthly_amount,
    CASE 
        WHEN p.subscription_plan = us.plan_id::text THEN 'MATCH ✅'
        ELSE 'MISMATCH ❌'
    END as data_sync_status
FROM profiles p
LEFT JOIN user_subscriptions us ON p.id = us.user_id
WHERE p.id = '32603d29-bb77-4be9-aa9a-bad5a699b6e8';

-- 4. Check enum types are working
SELECT 
    'ENUM_CHECK' as check_type,
    enumlabel as enum_value
FROM pg_enum 
WHERE enumtypid = (
    SELECT oid FROM pg_type WHERE typname = 'subscription_plan_type'
)
ORDER BY enumlabel;

-- 5. Test the subscription API endpoint data structure
SELECT 
    'API_READY_FORMAT' as format_type,
    p.id as user_id,
    p.email,
    us.plan_id,
    us.status,
    us.amount,
    us.stripe_subscription_id,
    us.current_period_end,
    -- This is what the API should return
    CASE 
        WHEN us.status = 'active' THEN true
        ELSE false
    END as is_subscribed,
    CASE 
        WHEN us.plan_id = 'navigator' THEN 'Navigator'
        WHEN us.plan_id = 'pro_parker' THEN 'Pro Parker'
        WHEN us.plan_id = 'fleet_manager' THEN 'Fleet Manager'
        ELSE 'Free'
    END as plan_display_name
FROM profiles p
LEFT JOIN user_subscriptions us ON p.id = us.user_id
WHERE p.id = '32603d29-bb77-4be9-aa9a-bad5a699b6e8';

-- ============================================================================
-- SUCCESS INDICATORS TO LOOK FOR:
-- ============================================================================
-- ✅ user_subscriptions shows: plan_id = 'navigator', status = 'active', amount = 9.90
-- ✅ profiles shows: subscription_plan = 'navigator', subscription_status = 'active'
-- ✅ COMBINED_VIEW shows: data_sync_status = 'MATCH ✅'
-- ✅ API_READY_FORMAT shows: is_subscribed = true, plan_display_name = 'Navigator'
-- ============================================================================
