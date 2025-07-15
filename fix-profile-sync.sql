-- Fix profile sync issues and automate backend updates
-- This addresses the constraint violation and ensures proper subscription sync

-- 1. Create subscription_tier enum if it doesn't exist
DO $$ 
BEGIN
    CREATE TYPE public.subscription_tier AS ENUM ('free', 'premium', 'pro', 'enterprise');
EXCEPTION
    WHEN duplicate_object THEN 
        -- Enum already exists, that's fine
        NULL;
END $$;

-- 2. Fix the profiles table to allow 'premium' and other values
DO $$ 
BEGIN
    -- Drop the old constraint if it exists
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS valid_subscription_plan;
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS valid_subscription_status;
    
    -- Add/update subscription_tier column first
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_tier subscription_tier DEFAULT 'free'::subscription_tier;
    
    -- Add/update subscription_plan column (map to subscription_tier)
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_plan text;
    
    -- Add/update subscription_status column if it doesn't exist
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'inactive';
    
    -- Debug: Show what columns we have
    RAISE NOTICE 'Columns added to profiles table successfully';
    
EXCEPTION
    WHEN others THEN
        -- Log the error but continue
        RAISE NOTICE 'Error adding columns: %', SQLERRM;
END $$;

-- 3. Ensure user_subscriptions table has email column
DO $$
BEGIN
    -- Check if email column exists, if not add it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_subscriptions' 
        AND column_name = 'email'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.user_subscriptions 
        ADD COLUMN email text;
        
        -- Create index for performance
        CREATE INDEX IF NOT EXISTS idx_user_subscriptions_email 
        ON public.user_subscriptions(email);
        
        -- Populate existing records with email from profiles
        UPDATE public.user_subscriptions 
        SET email = profiles.email
        FROM public.profiles 
        WHERE user_subscriptions.user_id = profiles.id
        AND user_subscriptions.email IS NULL;
        
        RAISE NOTICE 'Email column added to user_subscriptions table';
    ELSE
        RAISE NOTICE 'Email column already exists in user_subscriptions table';
    END IF;
END $$;

-- 4. Sync existing data from subscription_tier to subscription_plan (safely)
DO $$
BEGIN
    -- Only run this if both columns exist
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'subscription_tier') 
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'subscription_plan') THEN
        
        -- Update subscription_plan to match subscription_tier where needed
        UPDATE public.profiles 
        SET subscription_plan = subscription_tier::text
        WHERE subscription_plan IS NULL OR subscription_plan != subscription_tier::text;
        
        RAISE NOTICE 'Synced subscription_plan with subscription_tier';
    ELSE
        -- Set default values for subscription_plan if subscription_tier doesn't exist
        UPDATE public.profiles 
        SET subscription_plan = 'free'
        WHERE subscription_plan IS NULL;
        
        RAISE NOTICE 'Set default subscription_plan values';
    END IF;
END $$;

-- 5. Create or update the automatic sync function
CREATE OR REPLACE FUNCTION public.sync_profile_subscription(
  p_user_id uuid,
  p_plan_id text,
  p_status text DEFAULT 'active'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result jsonb;
  has_subscription_tier boolean;
BEGIN
  -- Check if subscription_tier column exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'subscription_tier'
    AND table_schema = 'public'
  ) INTO has_subscription_tier;
  
  -- Update subscription fields in profiles
  IF has_subscription_tier THEN
    -- Update all three columns if subscription_tier exists
    UPDATE public.profiles
    SET
      subscription_plan = p_plan_id,
      subscription_status = p_status,
      subscription_tier = p_plan_id::subscription_tier,
      updated_at = now()
    WHERE id = p_user_id;
  ELSE
    -- Update only subscription_plan and subscription_status if subscription_tier doesn't exist
    UPDATE public.profiles
    SET
      subscription_plan = p_plan_id,
      subscription_status = p_status,
      updated_at = now()
    WHERE id = p_user_id;
  END IF;
  
  -- Check if update was successful
  IF FOUND THEN
    v_result := jsonb_build_object(
      'success', true,
      'message', 'Profile subscription updated successfully',
      'user_id', p_user_id,
      'plan_id', p_plan_id,
      'status', p_status,
      'has_subscription_tier', has_subscription_tier
    );
  ELSE
    v_result := jsonb_build_object(
      'success', false,
      'message', 'User profile not found',
      'user_id', p_user_id
    );
  END IF;
  
  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    v_result := jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'sqlstate', SQLSTATE,
      'user_id', p_user_id
    );
    RETURN v_result;
END;
$$;

-- 6. Grant permissions
GRANT EXECUTE ON FUNCTION public.sync_profile_subscription(uuid, text, text) TO service_role;

-- 7. Update the main subscription handler to also sync profiles
CREATE OR REPLACE FUNCTION public.handle_subscription_update_with_profile_sync(
  p_user_id uuid,
  p_stripe_customer_id text,
  p_stripe_subscription_id text,
  p_plan_id text,
  p_status text,
  p_trial_end timestamptz DEFAULT NULL,
  p_current_period_end timestamptz DEFAULT NULL,
  p_email text DEFAULT NULL,
  p_amount numeric DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_subscription_result jsonb;
  v_profile_result jsonb;
  v_final_result jsonb;
  v_subscription_record record;
BEGIN
  -- Add amount column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_subscriptions' 
    AND column_name = 'amount'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.user_subscriptions ADD COLUMN amount numeric(10,2);
  END IF;

  -- First update/insert subscription
  UPDATE public.user_subscriptions
  SET
    stripe_customer_id = p_stripe_customer_id,
    stripe_subscription_id = p_stripe_subscription_id,
    plan_id = p_plan_id,
    status = p_status,
    trial_end = p_trial_end,
    current_period_end = p_current_period_end,
    email = COALESCE(p_email, email),
    amount = COALESCE(p_amount, amount),
    updated_at = now()
  WHERE user_id = p_user_id
  RETURNING * INTO v_subscription_record;

  -- If no record was updated, insert new one
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
      amount,
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
      p_amount,
      now(),
      now()
    )
    RETURNING * INTO v_subscription_record;
  END IF;

  -- Now sync the profile
  SELECT public.sync_profile_subscription(p_user_id, p_plan_id, p_status) INTO v_profile_result;

  -- Build final result
  v_final_result := jsonb_build_object(
    'success', true,
    'subscription', to_jsonb(v_subscription_record),
    'profile_sync', v_profile_result,
    'message', 'Subscription and profile updated successfully'
  );

  RETURN v_final_result;
EXCEPTION
  WHEN OTHERS THEN
    v_final_result := jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'sqlstate', SQLSTATE,
      'user_id', p_user_id
    );
    RETURN v_final_result;
END;
$$;

-- 8. Grant permissions for the new function
GRANT EXECUTE ON FUNCTION public.handle_subscription_update_with_profile_sync(uuid, text, text, text, text, timestamptz, timestamptz, text, numeric) TO service_role;

-- 9. Manually sync any existing mismatched profiles
DO $$
DECLARE
    has_subscription_tier boolean;
BEGIN
    -- Check if subscription_tier column exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'subscription_tier'
        AND table_schema = 'public'
    ) INTO has_subscription_tier;
    
    -- Only sync if we have existing user_subscriptions
    IF EXISTS (SELECT 1 FROM public.user_subscriptions LIMIT 1) THEN
        IF has_subscription_tier THEN
            -- Update all three columns if subscription_tier exists
            UPDATE public.profiles p
            SET
              subscription_plan = s.plan_id,
              subscription_status = s.status,
              subscription_tier = s.plan_id::subscription_tier,
              updated_at = now()
            FROM public.user_subscriptions s
            WHERE p.id = s.user_id
              AND (
                p.subscription_plan IS DISTINCT FROM s.plan_id OR 
                p.subscription_status IS DISTINCT FROM s.status
              );
            
            RAISE NOTICE 'Synced existing profiles with user_subscriptions (including subscription_tier)';
        ELSE
            -- Update only subscription_plan and subscription_status if subscription_tier doesn't exist
            UPDATE public.profiles p
            SET
              subscription_plan = s.plan_id,
              subscription_status = s.status,
              updated_at = now()
            FROM public.user_subscriptions s
            WHERE p.id = s.user_id
              AND (
                p.subscription_plan IS DISTINCT FROM s.plan_id OR 
                p.subscription_status IS DISTINCT FROM s.status
              );
            
            RAISE NOTICE 'Synced existing profiles with user_subscriptions (subscription_tier column missing)';
        END IF;
    ELSE
        RAISE NOTICE 'No user_subscriptions found to sync';
    END IF;
END $$;

-- 10. Now add constraints after data is synced
DO $$
BEGIN
    -- Drop any existing constraints first
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS valid_subscription_plan;
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS valid_subscription_status;
    
    -- Add constraint for subscription_plan with correct values (after data sync)
    ALTER TABLE public.profiles ADD CONSTRAINT valid_subscription_plan 
    CHECK (subscription_plan IN ('free', 'premium', 'pro', 'enterprise') OR subscription_plan IS NULL);
    
    -- Add constraint for subscription_status
    ALTER TABLE public.profiles ADD CONSTRAINT valid_subscription_status 
    CHECK (subscription_status IN ('active', 'inactive', 'trialing', 'past_due', 'canceled', 'incomplete') OR subscription_status IS NULL);
    
    RAISE NOTICE 'Constraints added successfully after data sync';
    
EXCEPTION
    WHEN duplicate_object THEN 
        -- Constraint already exists, that's fine
        RAISE NOTICE 'Constraint already exists, continuing...';
    WHEN others THEN
        -- Log the error but continue
        RAISE NOTICE 'Error adding constraints: %', SQLERRM;
END $$;

-- 11. Show results
DO $$
DECLARE
    synced_count integer;
BEGIN
    -- Count synced profiles safely
    SELECT COUNT(*)
    INTO synced_count
    FROM public.profiles p
    JOIN public.user_subscriptions s ON p.id = s.user_id
    WHERE p.subscription_plan = s.plan_id AND p.subscription_status = s.status;
    
    RAISE NOTICE 'Migration completed. Profiles synced: %', synced_count;
END $$;
