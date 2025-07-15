-- Fix the existing subscription record to populate email and add amount column
-- Run this in Supabase SQL Editor

-- 1. First, add amount column to user_subscriptions table
ALTER TABLE public.user_subscriptions 
ADD COLUMN IF NOT EXISTS amount numeric(10,2);

-- 2. Update the existing subscription record with email from profile
UPDATE public.user_subscriptions 
SET email = profiles.email
FROM public.profiles
WHERE user_subscriptions.user_id = profiles.id
AND user_subscriptions.email IS NULL;

-- 3. Show the updated record
SELECT 
    user_id,
    plan_id,
    status,
    email,
    amount,
    created_at,
    updated_at
FROM public.user_subscriptions
WHERE user_id = '32603d29-bb77-4be9-aa9a-bad5a699b6e8';
