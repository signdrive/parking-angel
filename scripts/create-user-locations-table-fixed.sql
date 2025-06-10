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

-- Admin policy using email check from profiles table
CREATE POLICY "Admins can view all locations" ON public.user_locations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND email IN (
                'admin@parkalgo.com', 
                'admin@parkingangel.com',
                'admin@example.com'
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

-- Add admin role column to profiles table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'is_admin') THEN
        ALTER TABLE public.profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin_user(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = user_id 
        AND (
            is_admin = TRUE 
            OR email IN (
                'admin@parkalgo.com', 
                'admin@parkingangel.com',
                'admin@example.com'
            )
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update admin policy to use the function
DROP POLICY IF EXISTS "Admins can view all locations" ON public.user_locations;
CREATE POLICY "Admins can view all locations" ON public.user_locations
    FOR SELECT USING (is_admin_user(auth.uid()));

-- Create admin policies for other operations
CREATE POLICY "Admins can insert any location" ON public.user_locations
    FOR INSERT WITH CHECK (is_admin_user(auth.uid()));

CREATE POLICY "Admins can update any location" ON public.user_locations
    FOR UPDATE USING (is_admin_user(auth.uid()));

CREATE POLICY "Admins can delete any location" ON public.user_locations
    FOR DELETE USING (is_admin_user(auth.uid()));

COMMENT ON TABLE public.user_locations IS 'Stores user location data with explicit consent for analytics and heatmap generation';
COMMENT ON COLUMN public.user_locations.consent_given IS 'Explicit user consent for location tracking';
COMMENT ON COLUMN public.user_locations.accuracy IS 'GPS accuracy in meters';
COMMENT ON COLUMN public.user_locations.session_id IS 'Groups locations by user session for analytics';
COMMENT ON FUNCTION is_admin_user IS 'Checks if a user has admin privileges';
