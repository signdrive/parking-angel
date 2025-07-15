-- Quick verification query to check if the migration worked
-- Run this in Supabase SQL Editor to verify the setup

-- 1. Check if all columns exist in profiles table
SELECT 
    'profiles columns' as table_name,
    column_name, 
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('subscription_plan', 'subscription_status', 'subscription_tier')
AND table_schema = 'public'
ORDER BY column_name;

-- 2. Check if user_subscriptions has email column
SELECT 
    'user_subscriptions email' as table_name,
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_subscriptions' 
AND column_name = 'email'
AND table_schema = 'public';

-- 3. Check if sync functions exist
SELECT 
    'sync functions' as check_type,
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('sync_profile_subscription', 'handle_subscription_update_with_profile_sync');

-- 4. Check current profile and subscription data
SELECT 
    'current data' as check_type,
    p.id,
    p.subscription_plan,
    p.subscription_status,
    p.subscription_tier,
    s.plan_id,
    s.status,
    s.email
FROM public.profiles p
LEFT JOIN public.user_subscriptions s ON p.id = s.user_id
WHERE s.user_id IS NOT NULL
LIMIT 5;
