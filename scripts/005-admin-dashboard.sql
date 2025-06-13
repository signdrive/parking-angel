-- Create or update tables for admin functionality
-- Enable Row Level Security (RLS)
ALTER TABLE parking_spots ENABLE ROW LEVEL SECURITY;

-- Create parking_spots table if it doesn't exist
CREATE TABLE IF NOT EXISTS parking_spots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_name TEXT NOT NULL,
  coordinates JSONB NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('street', 'garage', 'lot')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  reports INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL
);

-- Add role column to profiles if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 
    FROM information_schema.columns 
    WHERE table_name='profiles' AND column_name='role') 
  THEN
    ALTER TABLE profiles 
    ADD COLUMN role TEXT DEFAULT 'user';
  END IF;
END $$;

-- Create policies for parking_spots
CREATE POLICY "Enable read access for all users" ON parking_spots
  FOR SELECT USING (true);

CREATE POLICY "Enable write access for admins" ON parking_spots
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create function to update last_updated timestamp
CREATE OR REPLACE FUNCTION update_last_updated_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = TIMEZONE('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for last_updated
DROP TRIGGER IF EXISTS update_parking_spots_last_updated ON parking_spots;
CREATE TRIGGER update_parking_spots_last_updated
  BEFORE UPDATE ON parking_spots
  FOR EACH ROW
  EXECUTE FUNCTION update_last_updated_column();
