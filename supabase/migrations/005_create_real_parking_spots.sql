-- Create real_parking_spots table for storing parking spot data
CREATE TABLE real_parking_spots (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  provider text NOT NULL,
  provider_id text NOT NULL,
  name text NOT NULL,
  description text,
  address text,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  total_spaces integer DEFAULT 0,
  available_spaces integer DEFAULT 0,
  pricing_info jsonb,
  restrictions jsonb,
  amenities jsonb,
  operating_hours jsonb,
  contact_info jsonb,
  last_updated timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT true,
  UNIQUE(provider, provider_id)
);

-- Create indexes for better performance
CREATE INDEX idx_real_parking_spots_location ON real_parking_spots USING BTREE (latitude, longitude);
CREATE INDEX idx_real_parking_spots_provider ON real_parking_spots(provider);
CREATE INDEX idx_real_parking_spots_provider_id ON real_parking_spots(provider_id);
CREATE INDEX idx_real_parking_spots_active ON real_parking_spots(is_active) WHERE is_active = true;
CREATE INDEX idx_real_parking_spots_updated ON real_parking_spots(last_updated DESC);

-- Enable RLS
ALTER TABLE real_parking_spots ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view active parking spots" ON real_parking_spots FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Anonymous users can view active parking spots" ON real_parking_spots FOR SELECT TO anon USING (is_active = true);

-- Create function to calculate distance between two points
CREATE OR REPLACE FUNCTION calculate_distance(lat1 double precision, lon1 double precision, lat2 double precision, lon2 double precision)
RETURNS double precision AS $$
BEGIN
  RETURN (
    6371 * acos(
      cos(radians(lat1)) * cos(radians(lat2)) * cos(radians(lon2) - radians(lon1)) +
      sin(radians(lat1)) * sin(radians(lat2))
    )
  ) * 1000; -- Convert to meters
END;
$$ LANGUAGE plpgsql;
