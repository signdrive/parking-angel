-- Create parking_reports table
CREATE TABLE parking_reports (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  spot_id text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('available', 'occupied', 'reserved', 'blocked')),
  confidence integer DEFAULT 80 CHECK (confidence >= 1 AND confidence <= 100),
  photo_url text,
  notes text,
  location jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  verified boolean DEFAULT false,
  verification_count integer DEFAULT 0
);

-- Create indexes for better performance
CREATE INDEX idx_parking_reports_spot_id ON parking_reports(spot_id);
CREATE INDEX idx_parking_reports_user_id ON parking_reports(user_id);
CREATE INDEX idx_parking_reports_status ON parking_reports(status);
CREATE INDEX idx_parking_reports_created_at ON parking_reports(created_at DESC);
CREATE INDEX idx_parking_reports_location ON parking_reports USING gin(location);

-- Enable RLS (Row Level Security)
ALTER TABLE parking_reports ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all reports" ON parking_reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert their own reports" ON parking_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reports" ON parking_reports FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reports" ON parking_reports FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_parking_reports_updated_at BEFORE UPDATE ON parking_reports FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
