-- Manually sync the profile for the existing subscription
-- Run this in Supabase SQL Editor

-- 1. Check current state
SELECT 
    'Before sync' as status,
    p.id,
    p.subscription_plan,
    p.subscription_status,
    p.subscription_tier,
    s.plan_id,
    s.status,
    s.email
FROM public.profiles p
JOIN public.user_subscriptions s ON p.id = s.user_id
WHERE p.id = '32603d29-bb77-4be9-aa9a-bad5a699b6e8';

-- 2. Manually sync the profile
UPDATE public.profiles 
SET 
    subscription_plan = 'pro',
    subscription_status = 'active',
    subscription_tier = 'pro'::subscription_tier,
    updated_at = now()
WHERE id = '32603d29-bb77-4be9-aa9a-bad5a699b6e8';

-- 3. Check result
SELECT 
    'After sync' as status,
    p.id,
    p.subscription_plan,
    p.subscription_status,
    p.subscription_tier,
    s.plan_id,
    s.status,
    s.email
FROM public.profiles p
JOIN public.user_subscriptions s ON p.id = s.user_id
WHERE p.id = '32603d29-bb77-4be9-aa9a-bad5a699b6e8';
