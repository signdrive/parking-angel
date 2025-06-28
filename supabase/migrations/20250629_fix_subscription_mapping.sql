-- Fix subscription tier inconsistencies

-- First, drop the constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_subscription_tier_check;

-- Then recreate it with the proper values
ALTER TABLE profiles ADD CONSTRAINT profiles_subscription_tier_check 
  CHECK (subscription_tier IN ('free', 'premium', 'pro', 'enterprise'));

-- Update any 'navigator' values to 'premium'
UPDATE profiles 
SET subscription_tier = 'premium' 
WHERE subscription_tier = 'navigator';

-- Update any 'pro_parker' values to 'pro'
UPDATE profiles 
SET subscription_tier = 'pro' 
WHERE subscription_tier = 'pro_parker';

-- Update any 'fleet_manager' values to 'enterprise'
UPDATE profiles 
SET subscription_tier = 'enterprise' 
WHERE subscription_tier = 'fleet_manager';
