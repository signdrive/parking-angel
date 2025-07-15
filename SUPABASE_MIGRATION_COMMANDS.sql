-- ============================================================================
-- SUPABASE MIGRATION COMMANDS
-- Run these commands in the Supabase SQL Editor to fix service role permissions
-- ============================================================================

-- 1. Grant service role full permissions on user_subscriptions table (idempotent)
DO $$
BEGIN
    GRANT ALL ON TABLE public.user_subscriptions TO service_role;
EXCEPTION WHEN OTHERS THEN
    -- Policy may already exist, continue
    NULL;
END
$$;

-- 2. Grant service role full permissions on profiles table (idempotent)
DO $$
BEGIN
    GRANT ALL ON TABLE public.profiles TO service_role;
EXCEPTION WHEN OTHERS THEN
    -- Policy may already exist, continue
    NULL;
END
$$;

-- 3. Add RLS policy for service role to manage user_subscriptions (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_subscriptions' 
        AND policyname = 'Service role can manage all user subscriptions'
    ) THEN
        CREATE POLICY "Service role can manage all user subscriptions"
        ON public.user_subscriptions
        FOR ALL
        TO service_role
        USING (true)
        WITH CHECK (true);
    END IF;
END
$$;

-- 4. Add RLS policy for service role to manage profiles (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Service role can manage all profiles'
    ) THEN
        CREATE POLICY "Service role can manage all profiles"
        ON public.profiles
        FOR ALL
        TO service_role
        USING (true)
        WITH CHECK (true);
    END IF;
END
$$;

-- 5. Create helper function for atomic subscription and profile updates
CREATE OR REPLACE FUNCTION public.update_user_subscription_and_profile(
  p_user_id uuid,
  p_subscription_data jsonb,
  p_profile_data jsonb DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_subscription_result jsonb;
  v_profile_result jsonb;
  v_result jsonb;
BEGIN
  -- Update subscription
  UPDATE public.user_subscriptions
  SET
    stripe_customer_id = COALESCE((p_subscription_data->>'stripe_customer_id')::text, stripe_customer_id),
    stripe_subscription_id = COALESCE((p_subscription_data->>'stripe_subscription_id')::text, stripe_subscription_id),
    plan_id = COALESCE((p_subscription_data->>'plan_id')::text, plan_id),
    status = COALESCE((p_subscription_data->>'status')::text, status),
    trial_end = COALESCE((p_subscription_data->>'trial_end')::timestamptz, trial_end),
    current_period_end = COALESCE((p_subscription_data->>'current_period_end')::timestamptz, current_period_end),
    email = COALESCE((p_subscription_data->>'email')::text, email),
    updated_at = now()
  WHERE user_id = p_user_id
  RETURNING to_jsonb(user_subscriptions.*) INTO v_subscription_result;

  -- Update profile if profile data is provided
  IF p_profile_data IS NOT NULL THEN
    UPDATE public.profiles
    SET
      subscription_plan = COALESCE((p_profile_data->>'subscription_plan')::text, subscription_plan),
      subscription_status = COALESCE((p_profile_data->>'subscription_status')::text, subscription_status),
      updated_at = now()
    WHERE id = p_user_id
    RETURNING to_jsonb(profiles.*) INTO v_profile_result;
  END IF;

  -- Build result
  v_result := jsonb_build_object(
    'success', true,
    'subscription', v_subscription_result,
    'profile', v_profile_result
  );

  RETURN v_result;
END;
$$;

-- 6. Grant execute permission on the helper function to service role
GRANT EXECUTE ON FUNCTION public.update_user_subscription_and_profile(uuid, jsonb, jsonb) TO service_role;

-- 7. Create function to handle subscription updates with better error handling
CREATE OR REPLACE FUNCTION public.handle_subscription_update(
  p_user_id uuid,
  p_stripe_customer_id text,
  p_stripe_subscription_id text,
  p_plan_id text,
  p_status text,
  p_trial_end timestamptz DEFAULT NULL,
  p_current_period_end timestamptz DEFAULT NULL,
  p_email text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result jsonb;
  v_subscription_record record;
BEGIN
  -- First try to update existing subscription
  UPDATE public.user_subscriptions
  SET
    stripe_customer_id = p_stripe_customer_id,
    stripe_subscription_id = p_stripe_subscription_id,
    plan_id = p_plan_id,
    status = p_status,
    trial_end = p_trial_end,
    current_period_end = p_current_period_end,
    email = COALESCE(p_email, email),
    updated_at = now()
  WHERE user_id = p_user_id
  RETURNING * INTO v_subscription_record;

  -- If no record was updated, try to insert a new one
  IF v_subscription_record IS NULL THEN
    INSERT INTO public.user_subscriptions (
      user_id,
      stripe_customer_id,
      stripe_subscription_id,
      plan_id,
      status,
      trial_end,
      current_period_end,
      email,
      created_at,
      updated_at
    ) VALUES (
      p_user_id,
      p_stripe_customer_id,
      p_stripe_subscription_id,
      p_plan_id,
      p_status,
      p_trial_end,
      p_current_period_end,
      p_email,
      now(),
      now()
    )
    RETURNING * INTO v_subscription_record;
  END IF;

  -- Update the profile subscription fields
  UPDATE public.profiles
  SET
    subscription_plan = p_plan_id,
    subscription_status = p_status,
    updated_at = now()
  WHERE id = p_user_id;

  -- Return success result
  v_result := jsonb_build_object(
    'success', true,
    'subscription', to_jsonb(v_subscription_record),
    'message', 'Subscription updated successfully'
  );

  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    -- Return error result
    v_result := jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'sqlstate', SQLSTATE
    );
    RETURN v_result;
END;
$$;

-- 8. Grant execute permission on the subscription handler function
GRANT EXECUTE ON FUNCTION public.handle_subscription_update(uuid, text, text, text, text, timestamptz, timestamptz, text) TO service_role;

-- 9. Ensure service role can read auth.users table (needed for foreign key validation)
DO $$
BEGIN
    GRANT SELECT ON TABLE auth.users TO service_role;
EXCEPTION WHEN OTHERS THEN
    -- Permission may already exist, continue
    NULL;
END
$$;

-- 10. Add email column to user_subscriptions table
DO $$
BEGIN
    -- Check if email column already exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_subscriptions' 
        AND column_name = 'email'
        AND table_schema = 'public'
    ) THEN
        -- Add email column
        ALTER TABLE public.user_subscriptions 
        ADD COLUMN email text;
        
        -- Create index on email for better performance
        CREATE INDEX IF NOT EXISTS idx_user_subscriptions_email 
        ON public.user_subscriptions(email);
        
        -- Update existing records with email from profiles table
        UPDATE public.user_subscriptions 
        SET email = profiles.email
        FROM public.profiles 
        WHERE user_subscriptions.user_id = profiles.id
        AND user_subscriptions.email IS NULL;
        
        RAISE NOTICE 'Email column added to user_subscriptions table';
    ELSE
        RAISE NOTICE 'Email column already exists in user_subscriptions table';
    END IF;
END
$$;

-- 11. Update helper functions to include email handling
