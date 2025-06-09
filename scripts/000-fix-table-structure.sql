-- First, let's see what columns we actually have
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'parking_spots' AND table_schema = 'public';

-- Drop the existing table if it has issues and recreate it properly
DROP TABLE IF EXISTS public.parking_spots CASCADE;
DROP TABLE IF EXISTS public.spot_reports CASCADE;
DROP TABLE IF EXISTS public.spot_reviews CASCADE;

-- Create parking spots table with correct structure
CREATE TABLE IF NOT EXISTS public.parking_spots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    location GEOGRAPHY(POINT, 4326) GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography) STORED,
    address TEXT,
    spot_type TEXT CHECK (spot_type IN ('street', 'garage', 'lot', 'meter')) DEFAULT 'street',
    is_available BOOLEAN DEFAULT true,
    reported_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '15 minutes'),
    confidence_score INTEGER DEFAULT 100 CHECK (confidence_score >= 0 AND confidence_score <= 100),
    price_per_hour DECIMAL(10, 2),
    max_duration_hours INTEGER DEFAULT 24,
    restrictions TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recreate dependent tables
CREATE TABLE IF NOT EXISTS public.spot_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    spot_id UUID REFERENCES public.parking_spots(id) ON DELETE CASCADE,
    reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    report_type TEXT CHECK (report_type IN ('available', 'taken', 'invalid', 'expired')) NOT NULL,
    notes TEXT,
    photo_url TEXT,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.spot_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    spot_id UUID REFERENCES public.parking_spots(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    helpful_votes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_parking_spots_location ON public.parking_spots USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_parking_spots_available ON public.parking_spots (is_available, expires_at);
CREATE INDEX IF NOT EXISTS idx_parking_spots_reported_by ON public.parking_spots (reported_by);
CREATE INDEX IF NOT EXISTS idx_spot_reports_spot_id ON public.spot_reports (spot_id);
CREATE INDEX IF NOT EXISTS idx_spot_reports_reporter_id ON public.spot_reports (reporter_id);
CREATE INDEX IF NOT EXISTS idx_spot_reviews_spot_id ON public.spot_reviews (spot_id);

-- Enable RLS
ALTER TABLE public.parking_spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spot_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spot_reviews ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Parking spots are viewable by everyone" ON public.parking_spots FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert spots" ON public.parking_spots FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own spots" ON public.parking_spots FOR UPDATE USING (auth.uid() = reported_by);
CREATE POLICY "Users can delete own spots" ON public.parking_spots FOR DELETE USING (auth.uid() = reported_by);

CREATE POLICY "Spot reports are viewable by everyone" ON public.spot_reports FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert reports" ON public.spot_reports FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own reports" ON public.spot_reports FOR UPDATE USING (auth.uid() = reporter_id);

CREATE POLICY "Spot reviews are viewable by everyone" ON public.spot_reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert reviews" ON public.spot_reviews FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own reviews" ON public.spot_reviews FOR UPDATE USING (auth.uid() = reviewer_id);
