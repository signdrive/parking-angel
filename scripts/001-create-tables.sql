-- Enable PostGIS extension for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    reputation_score INTEGER DEFAULT 100,
    total_reports INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Parking spots table with geospatial data
CREATE TABLE IF NOT EXISTS public.parking_spots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    address TEXT,
    spot_type TEXT CHECK (spot_type IN ('street', 'garage', 'lot', 'meter')) DEFAULT 'street',
    is_available BOOLEAN DEFAULT true,
    reported_by UUID REFERENCES public.profiles(id),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '15 minutes'),
    confidence_score INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Spot reports for tracking accuracy
CREATE TABLE IF NOT EXISTS public.spot_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    spot_id UUID REFERENCES public.parking_spots(id) ON DELETE CASCADE,
    reporter_id UUID REFERENCES public.profiles(id),
    report_type TEXT CHECK (report_type IN ('available', 'taken', 'invalid')) NOT NULL,
    notes TEXT,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User reviews for spot accuracy
CREATE TABLE IF NOT EXISTS public.spot_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    spot_id UUID REFERENCES public.parking_spots(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES public.profiles(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_parking_spots_location ON public.parking_spots USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_parking_spots_available ON public.parking_spots (is_available, expires_at);
CREATE INDEX IF NOT EXISTS idx_spot_reports_spot_id ON public.spot_reports (spot_id);
CREATE INDEX IF NOT EXISTS idx_spot_reviews_spot_id ON public.spot_reviews (spot_id);

-- Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parking_spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spot_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spot_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Parking spots are viewable by everyone" ON public.parking_spots FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert spots" ON public.parking_spots FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own spots" ON public.parking_spots FOR UPDATE USING (auth.uid() = reported_by);

CREATE POLICY "Spot reports are viewable by everyone" ON public.spot_reports FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert reports" ON public.spot_reports FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Spot reviews are viewable by everyone" ON public.spot_reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert reviews" ON public.spot_reviews FOR INSERT WITH CHECK (auth.role() = 'authenticated');
