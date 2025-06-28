// Test RLS policies for user_subscriptions
BEGIN;

-- Create a test user
INSERT INTO auth.users (id, email)
VALUES ('test-user-id', 'test@example.com');

-- Test service role policy
SET request.jwt.claim.role = 'service_role';
INSERT INTO user_subscriptions (
  user_id,
  plan_id,
  status,
  created_at,
  updated_at
) VALUES (
  'test-user-id',
  'navigator',
  'active',
  NOW(),
  NOW()
);

-- Verify the insert worked
SELECT * FROM user_subscriptions WHERE user_id = 'test-user-id';

-- Clean up
DELETE FROM user_subscriptions WHERE user_id = 'test-user-id';
DELETE FROM auth.users WHERE id = 'test-user-id';

ROLLBACK;
