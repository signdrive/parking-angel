-- Fix column naming inconsistencies across all tables
-- Drop existing tables to recreate with consistent naming

-- Drop dependent objects first
DROP FUNCTION IF EXISTS cleanup_expired_spots() CASCADE;
DROP FUNCTION IF EXISTS find_nearby_spots(DECIMAL, DECIMAL, INTEGER, TEXT, DECIMAL, BOOLEAN) CASCADE;
DROP FUNCTION IF EXISTS update_user_reputation(UUID, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS get_user_stats(UUID) CASCADE;
DROP FUNCTION IF EXISTS calculate_parking_demand(DECIMAL, DECIMAL, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS create_ai_prediction(DECIMAL, DECIMAL, TEXT, JSONB, DECIMAL, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_spot_confidence() CASCADE;

-- Drop tables in correct order (respecting foreign keys)
DROP TABLE IF EXISTS public.spot_reports CASCADE;
DROP TABLE IF EXISTS public.spot_reviews CASCADE;
DROP TABLE IF EXISTS public.user_activities CASCADE;
DROP TABLE IF EXISTS public.ai_predictions CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.fcm_tokens CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.parking_spots CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Recreate profiles table
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    reputation_score INTEGER DEFAULT 100,
    total_reports INTEGER DEFAULT 0,
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'enterprise')),
    preferences JSONB DEFAULT '{"notifications": true, "radius": 500, "autoRefresh": true}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recreate parking_spots table with consistent naming
CREATE TABLE public.parking_spots (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recreate spot_reports table
CREATE TABLE public.spot_reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    spot_id UUID REFERENCES public.parking_spots(id) ON DELETE CASCADE,
    reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    report_type TEXT CHECK (report_type IN ('available', 'taken', 'invalid', 'expired')) NOT NULL,
    notes TEXT,
    photo_url TEXT,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recreate spot_reviews table
CREATE TABLE public.spot_reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    spot_id UUID REFERENCES public.parking_spots(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    helpful_votes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recreate user_activities table with correct column name
CREATE TABLE public.user_activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    activity_data JSONB,
    location GEOGRAPHY(POINT, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recreate ai_predictions table
CREATE TABLE public.ai_predictions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    prediction_type TEXT NOT NULL,
    prediction_data JSONB NOT NULL,
    confidence_score DECIMAL(5, 4) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    valid_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recreate notifications table
CREATE TABLE public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    notification_type TEXT DEFAULT 'info' CHECK (notification_type IN ('info', 'warning', 'success', 'error')),
    data JSONB,
    read BOOLEAN DEFAULT false,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recreate fcm_tokens table
CREATE TABLE public.fcm_tokens (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    device_info JSONB,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recreate subscriptions table
CREATE TABLE public.subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    tier TEXT NOT NULL CHECK (tier IN ('free', 'premium', 'enterprise')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'pending')),
    stripe_subscription_id TEXT,
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_parking_spots_location ON public.parking_spots USING GIST (location);
CREATE INDEX idx_parking_spots_available ON public.parking_spots (is_available, expires_at);
CREATE INDEX idx_parking_spots_reported_by ON public.parking_spots (reported_by);
CREATE INDEX idx_spot_reports_spot_id ON public.spot_reports (spot_id);
CREATE INDEX idx_spot_reports_reporter_id ON public.spot_reports (reporter_id);
CREATE INDEX idx_spot_reviews_spot_id ON public.spot_reviews (spot_id);
CREATE INDEX idx_user_activities_user_id ON public.user_activities (user_id);
CREATE INDEX idx_user_activities_created_at ON public.user_activities (created_at);
CREATE INDEX idx_ai_predictions_location ON public.ai_predictions USING GIST (location);
CREATE INDEX idx_notifications_user_id ON public.notifications (user_id);
CREATE INDEX idx_fcm_tokens_user_id ON public.fcm_tokens (user_id);
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions (user_id);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parking_spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spot_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spot_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fcm_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Parking spots policies
CREATE POLICY "Parking spots are viewable by everyone" ON public.parking_spots FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert spots" ON public.parking_spots FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own spots" ON public.parking_spots FOR UPDATE USING (auth.uid() = reported_by);
CREATE POLICY "Users can delete own spots" ON public.parking_spots FOR DELETE USING (auth.uid() = reported_by);

-- Spot reports policies
CREATE POLICY "Spot reports are viewable by everyone" ON public.spot_reports FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert reports" ON public.spot_reports FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own reports" ON public.spot_reports FOR UPDATE USING (auth.uid() = reporter_id);

-- Spot reviews policies
CREATE POLICY "Spot reviews are viewable by everyone" ON public.spot_reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert reviews" ON public.spot_reviews FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own reviews" ON public.spot_reviews FOR UPDATE USING (auth.uid() = reviewer_id);

-- User activities policies
CREATE POLICY "Users can view own activities" ON public.user_activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own activities" ON public.user_activities FOR INSERT WITH CHECK (auth.uid() = user_id);

-- AI predictions policies
CREATE POLICY "AI predictions are viewable by everyone" ON public.ai_predictions FOR SELECT USING (true);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- FCM tokens policies
CREATE POLICY "Users can manage own FCM tokens" ON public.fcm_tokens FOR ALL USING (auth.uid() = user_id);

-- Subscriptions policies
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own subscriptions" ON public.subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
