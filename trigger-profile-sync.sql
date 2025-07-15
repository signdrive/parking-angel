-- Call the sync function to update the profile
-- Run this in Supabase SQL Editor

SELECT public.sync_profile_subscription(
    '32603d29-bb77-4be9-aa9a-bad5a699b6e8'::uuid, 
    'pro', 
    'active'
);

-- Then check the result
SELECT 
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
