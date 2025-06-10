-- Create user_locations table for tracking user positions (with consent)
CREATE TABLE IF NOT EXISTS public.user_locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    accuracy DECIMAL(10, 2), -- GPS accuracy in meters
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    consent_given BOOLEAN DEFAULT FALSE,
    session_id TEXT, -- To group locations by session
    
    -- Add spatial index for efficient location queries
    location GEOGRAPHY(POINT, 4326) GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)) STORED
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_locations_user_id ON public.user_locations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_locations_created_at ON public.user_locations(created_at);
CREATE INDEX IF NOT EXISTS idx_user_locations_location ON public.user_locations USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_user_locations_session ON public.user_locations(session_id);

-- Enable RLS
ALTER TABLE public.user_locations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can insert their own locations" ON public.user_locations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own locations" ON public.user_locations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all locations" ON public.user_locations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND (
                email IN ('admin@parkalgo.com', 'admin@parkingangel.com')
                OR user_metadata->>'role' = 'admin'
            )
        )
    );

-- Function to clean old location data (older than 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_user_locations()
RETURNS void AS $$
BEGIN
    DELETE FROM public.user_locations 
    WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a scheduled job to clean old data (if pg_cron is available)
-- SELECT cron.schedule('cleanup-user-locations', '0 2 * * *', 'SELECT cleanup_old_user_locations();');

COMMENT ON TABLE public.user_locations IS 'Stores user location data with explicit consent for analytics and heatmap generation';
COMMENT ON COLUMN public.user_locations.consent_given IS 'Explicit user consent for location tracking';
COMMENT ON COLUMN public.user_locations.accuracy IS 'GPS accuracy in meters';
COMMENT ON COLUMN public.user_locations.session_id IS 'Groups locations by user session for analytics';
