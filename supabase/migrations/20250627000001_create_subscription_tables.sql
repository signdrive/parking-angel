-- Create subscription tables and set up permissions

-- Enable RLS
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own subscriptions"
ON user_subscriptions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert/update subscriptions"
ON user_subscriptions FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Add foreign key constraint if not exists
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_subscriptions_user_id_fkey'
    ) THEN
        ALTER TABLE user_subscriptions
        ADD CONSTRAINT user_subscriptions_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES auth.users(id)
        ON DELETE CASCADE;
    END IF;
END $$;

-- Create subscription events table if not exists
CREATE TABLE IF NOT EXISTS public.subscription_events (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type text NOT NULL,
    tier text,
    stripe_event_id text,
    subscription_id text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    event_data jsonb
);

-- Enable RLS on subscription events
ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;

-- Create policies for subscription events
CREATE POLICY "Users can view their own subscription events"
ON subscription_events FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert/update subscription events"
ON subscription_events FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_user_id ON subscription_events(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_created_at ON subscription_events(created_at);
