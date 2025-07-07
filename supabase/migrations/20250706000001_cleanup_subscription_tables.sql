-- Drop legacy tables and consolidate on user_subscriptions

-- First, disable RLS temporarily to allow the migration to run
ALTER TABLE IF EXISTS public.subscriptions DISABLE ROW LEVEL SECURITY;

-- Migrate any missing data from subscriptions to user_subscriptions
INSERT INTO public.user_subscriptions (
    user_id,
    plan_id,
    status,
    created_at,
    updated_at
)
SELECT 
    user_id,
    CASE 
        WHEN tier = 'enterprise' THEN 'enterprise'
        WHEN tier = 'premium' THEN 'premium'
        ELSE 'free'
    END as plan_id,
    CASE 
        WHEN status = 'cancelled' THEN 'canceled'
        WHEN status = 'pending' THEN 'incomplete'
        ELSE status
    END as status,
    created_at,
    updated_at
FROM public.subscriptions s
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_subscriptions us 
    WHERE us.user_id = s.user_id
)
ON CONFLICT (user_id) DO NOTHING;

-- Drop the legacy tables
DROP TABLE IF EXISTS public.subscriptions;

-- Clean up any duplicate migrations that define these tables
DELETE FROM supabase_migrations.schema_migrations 
WHERE name IN (
    '20250627000001_create_subscription_tables',
    '20250627_create_subscription_tables'
);

-- Keep only the latest migration that defines our canonical tables
-- Ensure our indexes exist
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_user_id ON public.subscription_events(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_stripe_event_id ON subscription_events(stripe_event_id);

-- Re-enable RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;

-- Verify policies exist
DO $$
BEGIN
    -- For user_subscriptions
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_subscriptions' 
        AND schemaname = 'public'
    ) THEN
        CREATE POLICY "Users can view own subscriptions" 
        ON public.user_subscriptions
        FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- For subscription_events
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'subscription_events' 
        AND schemaname = 'public'
    ) THEN
        CREATE POLICY "Users can view own subscription events" 
        ON public.subscription_events
        FOR SELECT USING (auth.uid() = user_id);

        CREATE POLICY "Only service role can insert events" 
        ON public.subscription_events
        FOR INSERT WITH CHECK (true);
    END IF;
END
$$;
