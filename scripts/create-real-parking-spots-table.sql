-- Create table for real-world parking data
CREATE TABLE IF NOT EXISTS public.real_parking_spots (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    provider text NOT NULL,
    provider_id text NOT NULL,
    name text NOT NULL,
    latitude numeric NOT NULL,
    longitude numeric NOT NULL,
    address text,
    spot_type text CHECK (spot_type IN ('street', 'garage', 'lot', 'meter', 'private')),
    price_per_hour numeric,
    is_available boolean DEFAULT true,
    total_spaces integer,
    available_spaces integer,
    real_time_data boolean DEFAULT false,
    last_updated timestamp with time zone DEFAULT NOW(),
    metadata jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW(),
    
    -- Ensure unique provider spots
    UNIQUE(provider, provider_id)
);

-- Add spatial index for location queries
CREATE INDEX IF NOT EXISTS idx_real_parking_spots_location 
ON public.real_parking_spots USING GIST (
    ST_Point(longitude::double precision, latitude::double precision)
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_real_parking_spots_provider ON public.real_parking_spots(provider);
CREATE INDEX IF NOT EXISTS idx_real_parking_spots_type ON public.real_parking_spots(spot_type);
CREATE INDEX IF NOT EXISTS idx_real_parking_spots_available ON public.real_parking_spots(is_available);
CREATE INDEX IF NOT EXISTS idx_real_parking_spots_price ON public.real_parking_spots(price_per_hour);
CREATE INDEX IF NOT EXISTS idx_real_parking_spots_updated ON public.real_parking_spots(last_updated);

-- Enable RLS
ALTER TABLE public.real_parking_spots ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Real parking spots are viewable by everyone" 
ON public.real_parking_spots FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert real parking spots" 
ON public.real_parking_spots FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update real parking spots" 
ON public.real_parking_spots FOR UPDATE 
TO authenticated 
USING (true);

-- Create function to find nearby real parking spots
CREATE OR REPLACE FUNCTION find_nearby_real_spots(
    user_lat numeric,
    user_lng numeric,
    radius_meters integer DEFAULT 1000,
    spot_type_filter text DEFAULT NULL,
    max_price numeric DEFAULT NULL,
    only_available boolean DEFAULT true,
    require_real_time boolean DEFAULT false
)
RETURNS TABLE (
    id uuid,
    provider text,
    provider_id text,
    name text,
    latitude numeric,
    longitude numeric,
    address text,
    spot_type text,
    price_per_hour numeric,
    is_available boolean,
    total_spaces integer,
    available_spaces integer,
    real_time_data boolean,
    distance_meters double precision,
    metadata jsonb,
    last_updated timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rps.id,
        rps.provider,
        rps.provider_id,
        rps.name,
        rps.latitude,
        rps.longitude,
        rps.address,
        rps.spot_type,
        rps.price_per_hour,
        rps.is_available,
        rps.total_spaces,
        rps.available_spaces,
        rps.real_time_data,
        ST_Distance(
            ST_Point(rps.longitude::double precision, rps.latitude::double precision)::geography,
            ST_Point(user_lng::double precision, user_lat::double precision)::geography
        ) as distance_meters,
        rps.metadata,
        rps.last_updated
    FROM public.real_parking_spots rps
    WHERE 
        (only_available = false OR rps.is_available = true)
        AND ST_DWithin(
            ST_Point(rps.longitude::double precision, rps.latitude::double precision)::geography,
            ST_Point(user_lng::double precision, user_lat::double precision)::geography,
            radius_meters
        )
        AND (spot_type_filter IS NULL OR rps.spot_type = spot_type_filter)
        AND (max_price IS NULL OR rps.price_per_hour IS NULL OR rps.price_per_hour <= max_price)
        AND (require_real_time = false OR rps.real_time_data = true)
    ORDER BY distance_meters ASC
    LIMIT 100;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION find_nearby_real_spots(numeric, numeric, integer, text, numeric, boolean, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION find_nearby_real_spots(numeric, numeric, integer, text, numeric, boolean, boolean) TO anon;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_real_parking_spots_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_real_parking_spots_updated_at
    BEFORE UPDATE ON public.real_parking_spots
    FOR EACH ROW
    EXECUTE FUNCTION update_real_parking_spots_updated_at();

-- Insert some sample real parking data for testing
INSERT INTO public.real_parking_spots (
    provider, provider_id, name, latitude, longitude, address, spot_type, 
    price_per_hour, total_spaces, available_spaces, real_time_data, metadata
) VALUES 
-- San Francisco samples
('google_places', 'sf_union_square_garage', 'Union Square Garage', 37.7880, -122.4074, '333 Post St, San Francisco, CA', 'garage', 8.0, 1800, 450, true, '{"accessibility": true, "ev_charging": true, "security": true}'),
('openstreetmap', 'sf_pier_39_lot', 'Pier 39 Parking', 37.8087, -122.4098, 'Pier 39, San Francisco, CA', 'lot', 6.0, 1000, 200, false, '{"covered": false, "accessibility": true}'),
('city_api', 'sf_meter_001', 'Market Street Meter', 37.7849, -122.4094, 'Market St & 4th St, San Francisco, CA', 'meter', 4.0, 1, 1, true, '{"max_duration": "2 hours"}'),

-- New York samples  
('google_places', 'nyc_times_square_garage', 'Times Square Parking', 40.7580, -73.9855, '1515 Broadway, New York, NY', 'garage', 12.0, 500, 50, true, '{"accessibility": true, "security": true}'),
('city_api', 'nyc_central_park_meter', 'Central Park West Meter', 40.7829, -73.9654, 'Central Park West, New York, NY', 'meter', 5.0, 1, 0, true, '{"restrictions": ["2 hour limit", "No parking 8-10am"]}'),

-- London samples
('city_api', 'london_hyde_park_garage', 'Hyde Park Corner Car Park', 51.5045, -0.1527, 'Hyde Park Corner, London, UK', 'garage', 4.5, 200, 45, true, '{"accessibility": true, "covered": true}'),
('openstreetmap', 'london_covent_garden', 'Covent Garden Parking', 51.5118, -0.1226, 'Covent Garden, London, UK', 'lot', 6.0, 150, 30, false, '{"accessibility": true}'),

-- Paris samples
('city_api', 'paris_louvre_garage', 'Parking du Louvre', 48.8606, 2.3376, 'Place du Carrousel, Paris, France', 'garage', 3.5, 600, 120, true, '{"accessibility": true, "security": true}'),
('openstreetmap', 'paris_champs_elysees', 'Champs-Élysées Parking', 48.8698, 2.3076, 'Avenue des Champs-Élysées, Paris, France', 'street', 2.4, 50, 10, false, '{"restrictions": ["Resident permit required"]}')

ON CONFLICT (provider, provider_id) DO UPDATE SET
    name = EXCLUDED.name,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    address = EXCLUDED.address,
    price_per_hour = EXCLUDED.price_per_hour,
    total_spaces = EXCLUDED.total_spaces,
    available_spaces = EXCLUDED.available_spaces,
    real_time_data = EXCLUDED.real_time_data,
    metadata = EXCLUDED.metadata,
    updated_at = NOW();

-- Test the function
SELECT * FROM find_nearby_real_spots(37.7749, -122.4194, 5000) LIMIT 10;
