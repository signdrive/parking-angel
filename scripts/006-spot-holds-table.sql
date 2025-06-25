-- Create spot holds table for premium spot reservation feature
-- This enables the $0.99/15min spot hold service

CREATE TABLE IF NOT EXISTS public.spot_holds (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL,
    spot_id uuid NOT NULL,
    hold_type text NOT NULL CHECK (hold_type IN ('quick_hold', 'extended_hold')),
    duration_minutes integer NOT NULL CHECK (duration_minutes IN (15, 30, 60)),
    amount_paid numeric(10,2) NOT NULL,
    payment_intent_id text,
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'released', 'used')),
    starts_at timestamp with time zone NOT NULL DEFAULT NOW(),
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW(),
    
    -- Foreign key relationships
    CONSTRAINT fk_spot_holds_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT fk_spot_holds_spot_id FOREIGN KEY (spot_id) REFERENCES public.parking_spots(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_spot_holds_user_id ON public.spot_holds(user_id);
CREATE INDEX IF NOT EXISTS idx_spot_holds_spot_id ON public.spot_holds(spot_id);
CREATE INDEX IF NOT EXISTS idx_spot_holds_status ON public.spot_holds(status);
CREATE INDEX IF NOT EXISTS idx_spot_holds_expires_at ON public.spot_holds(expires_at);
CREATE INDEX IF NOT EXISTS idx_spot_holds_active ON public.spot_holds(status, expires_at) WHERE status = 'active';

-- Enable RLS
ALTER TABLE public.spot_holds ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own holds" 
ON public.spot_holds FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own holds" 
ON public.spot_holds FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own holds" 
ON public.spot_holds FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all holds" 
ON public.spot_holds FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Function to automatically expire holds
CREATE OR REPLACE FUNCTION expire_old_holds()
RETURNS trigger AS $$
BEGIN
    UPDATE public.spot_holds 
    SET status = 'expired', updated_at = NOW()
    WHERE status = 'active' 
    AND expires_at < NOW();
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to run expiration check
DROP TRIGGER IF EXISTS trigger_expire_holds ON public.spot_holds;
CREATE TRIGGER trigger_expire_holds
    AFTER INSERT OR UPDATE ON public.spot_holds
    FOR EACH STATEMENT
    EXECUTE FUNCTION expire_old_holds();

-- Function to get active hold for a spot
CREATE OR REPLACE FUNCTION get_spot_active_hold(spot_uuid uuid)
RETURNS TABLE (
    hold_id uuid,
    user_id uuid,
    expires_at timestamp with time zone,
    duration_minutes integer,
    amount_paid numeric,
    user_name text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sh.id,
        sh.user_id,
        sh.expires_at,
        sh.duration_minutes,
        sh.amount_paid,
        p.full_name
    FROM public.spot_holds sh
    LEFT JOIN public.profiles p ON sh.user_id = p.id
    WHERE sh.spot_id = spot_uuid
    AND sh.status = 'active'
    AND sh.expires_at > NOW()
    ORDER BY sh.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a new spot hold
CREATE OR REPLACE FUNCTION create_spot_hold(
    p_user_id uuid,
    p_spot_id uuid,
    p_duration_minutes integer,
    p_amount_paid numeric,
    p_payment_intent_id text DEFAULT NULL
)
RETURNS TABLE (
    success boolean,
    hold_id uuid,
    expires_at timestamp with time zone,
    error_message text
) AS $$
DECLARE
    existing_hold_count integer;
    new_hold_id uuid;
    new_expires_at timestamp with time zone;
    hold_type_val text;
BEGIN
    -- Check if spot already has an active hold
    SELECT COUNT(*) INTO existing_hold_count
    FROM public.spot_holds
    WHERE spot_id = p_spot_id
    AND status = 'active'
    AND expires_at > NOW();
    
    IF existing_hold_count > 0 THEN
        RETURN QUERY SELECT false, NULL::uuid, NULL::timestamp with time zone, 'Spot is already held by another user';
        RETURN;
    END IF;
    
    -- Determine hold type
    hold_type_val := CASE 
        WHEN p_duration_minutes <= 15 THEN 'quick_hold'
        ELSE 'extended_hold'
    END;
    
    -- Calculate expiration time
    new_expires_at := NOW() + (p_duration_minutes || ' minutes')::interval;
    
    -- Create the hold
    INSERT INTO public.spot_holds (
        user_id, spot_id, hold_type, duration_minutes, 
        amount_paid, payment_intent_id, expires_at
    ) VALUES (
        p_user_id, p_spot_id, hold_type_val, p_duration_minutes,
        p_amount_paid, p_payment_intent_id, new_expires_at
    ) RETURNING id INTO new_hold_id;
    
    RETURN QUERY SELECT true, new_hold_id, new_expires_at, NULL::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to release a hold early
CREATE OR REPLACE FUNCTION release_spot_hold(p_hold_id uuid, p_user_id uuid)
RETURNS boolean AS $$
DECLARE
    hold_exists boolean;
BEGIN
    -- Check if hold exists and belongs to user
    SELECT EXISTS(
        SELECT 1 FROM public.spot_holds
        WHERE id = p_hold_id 
        AND user_id = p_user_id
        AND status = 'active'
    ) INTO hold_exists;
    
    IF NOT hold_exists THEN
        RETURN false;
    END IF;
    
    -- Release the hold
    UPDATE public.spot_holds
    SET status = 'released', updated_at = NOW()
    WHERE id = p_hold_id AND user_id = p_user_id;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.spot_holds TO authenticated;
GRANT EXECUTE ON FUNCTION get_spot_active_hold(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION create_spot_hold(uuid, uuid, integer, numeric, text) TO authenticated;
GRANT EXECUTE ON FUNCTION release_spot_hold(uuid, uuid) TO authenticated;

-- Enable real-time subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE public.spot_holds;

-- Add some sample pricing data
COMMENT ON TABLE public.spot_holds IS 'Spot hold reservations: 15min=$0.99, 30min=$1.99, 60min=$3.99';
