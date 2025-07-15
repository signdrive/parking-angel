-- Create vehicle_types table
CREATE TABLE vehicle_types (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  category text NOT NULL CHECK (category IN ('car', 'motorcycle', 'bicycle', 'truck', 'van', 'bus', 'other')),
  length_cm integer,
  width_cm integer,
  height_cm integer,
  weight_kg integer,
  special_requirements jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Create user_vehicles table
CREATE TABLE user_vehicles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_type_id uuid NOT NULL REFERENCES vehicle_types(id) ON DELETE CASCADE,
  nickname text,
  license_plate text,
  color text,
  is_primary boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create parking_compatibility table
CREATE TABLE parking_compatibility (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  spot_id text NOT NULL,
  vehicle_category text NOT NULL,
  max_length_cm integer,
  max_width_cm integer,
  max_height_cm integer,
  max_weight_kg integer,
  restrictions jsonb,
  compatibility_score integer DEFAULT 100 CHECK (compatibility_score >= 0 AND compatibility_score <= 100),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Insert default vehicle types
INSERT INTO vehicle_types (name, category, length_cm, width_cm, height_cm, weight_kg, special_requirements) VALUES
('Compact Car', 'car', 400, 175, 150, 1500, '{"turning_radius": "small", "parking_ease": "high"}'),
('Sedan', 'car', 470, 180, 150, 1800, '{"turning_radius": "medium", "parking_ease": "medium"}'),
('SUV', 'car', 500, 190, 180, 2200, '{"turning_radius": "large", "parking_ease": "low"}'),
('Pickup Truck', 'truck', 550, 200, 190, 2500, '{"turning_radius": "large", "parking_ease": "low", "requires_truck_spots": true}'),
('Motorcycle', 'motorcycle', 220, 80, 120, 250, '{"can_use_bike_spots": true, "compact_parking": true}'),
('Bicycle', 'bicycle', 180, 60, 110, 15, '{"requires_bike_rack": true, "very_compact": true}'),
('Small Van', 'van', 480, 185, 200, 2000, '{"commercial_restrictions": "possible", "height_sensitive": true}'),
('Large Van', 'van', 600, 200, 250, 3000, '{"commercial_restrictions": "likely", "height_sensitive": true}'),
('Electric Car', 'car', 450, 180, 150, 1600, '{"requires_charging": "optional", "eco_friendly": true}'),
('Hybrid Car', 'car', 460, 180, 150, 1700, '{"eco_friendly": true}');

-- Create indexes
CREATE INDEX idx_user_vehicles_user_id ON user_vehicles(user_id);
CREATE INDEX idx_user_vehicles_vehicle_type_id ON user_vehicles(vehicle_type_id);
CREATE INDEX idx_user_vehicles_primary ON user_vehicles(is_primary) WHERE is_primary = true;

CREATE INDEX idx_parking_compatibility_spot_id ON parking_compatibility(spot_id);
CREATE INDEX idx_parking_compatibility_vehicle_category ON parking_compatibility(vehicle_category);

-- Enable RLS
ALTER TABLE user_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE parking_compatibility ENABLE ROW LEVEL SECURITY;

-- Create policies for user_vehicles
CREATE POLICY "Users can view their own vehicles" ON user_vehicles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own vehicles" ON user_vehicles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own vehicles" ON user_vehicles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own vehicles" ON user_vehicles FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Create policies for parking_compatibility (read-only for users)
CREATE POLICY "Users can view parking compatibility" ON parking_compatibility FOR SELECT TO authenticated USING (true);

-- Create triggers
CREATE TRIGGER update_user_vehicles_updated_at BEFORE UPDATE ON user_vehicles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_parking_compatibility_updated_at BEFORE UPDATE ON parking_compatibility FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
