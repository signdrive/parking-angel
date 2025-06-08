-- Recreate the parking_usage_history table with proper column names

-- Drop the existing table if it exists
DROP TABLE IF EXISTS public.parking_usage_history;

-- Create the table with properly quoted column names
CREATE TABLE public.parking_usage_history (
    id SERIAL PRIMARY KEY,
    spot_id TEXT NOT NULL REFERENCES public.parking_spots(id),
    action TEXT NOT NULL,
    "timestamp" TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.parking_usage_history ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users" ON public.parking_usage_history
    USING (true)
    WITH CHECK (true);

-- Allow read-only access for anonymous users
CREATE POLICY "Allow read-only access for anonymous users" ON public.parking_usage_history
    FOR SELECT
    USING (true);

-- Grant permissions
GRANT ALL ON public.parking_usage_history TO authenticated;
GRANT SELECT ON public.parking_usage_history TO anon;
GRANT USAGE ON SEQUENCE public.parking_usage_history_id_seq TO authenticated;

-- Add sample usage history for these spots
INSERT INTO public.parking_usage_history (spot_id, action, "timestamp") VALUES
('google_ChIJRy77kq5Rw0cR56z6UkSoOC8', 'occupied', 'Sun Mar 09 2025 20:23:20 GMT+0100 (Midden-Europese standaardtijd)'),
('google_ChIJRy77kq5Rw0cR56z6UkSoOC8', 'vacated', 'Sun Mar 09 2025 21:23:20 GMT+0100 (Midden-Europese standaardtijd)'),
('osm_696987981', 'occupied', 'Sun Mar 09 2025 20:23:21 GMT+0100 (Midden-Europese standaardtijd)'),
('osm_696987981', 'vacated', 'Sun Mar 09 2025 21:23:21 GMT+0100 (Midden-Europese standaardtijd)'),
('osm_696987982', 'occupied', 'Sun Mar 09 2025 20:23:22 GMT+0100 (Midden-Europese standaardtijd)'),
('osm_696987982', 'vacated', 'Sun Mar 09 2025 21:23:22 GMT+0100 (Midden-Europese standaardtijd)'),
('osm_707556793', 'occupied', 'Sun Mar 09 2025 20:23:22 GMT+0100 (Midden-Europese standaardtijd)'),
('osm_707556793', 'vacated', 'Sun Mar 09 2025 21:23:22 GMT+0100 (Midden-Europese standaardtijd)'),
('osm_721148421', 'occupied', 'Sun Mar 09 2025 20:23:23 GMT+0100 (Midden-Europese standaardtijd)'),
('osm_721148421', 'vacated', 'Sun Mar 09 2025 21:23:23 GMT+0100 (Midden-Europese standaardtijd)'),
('osm_721696625', 'occupied', 'Sun Mar 09 2025 20:23:23 GMT+0100 (Midden-Europese standaardtijd)'),
('osm_721696625', 'vacated', 'Sun Mar 09 2025 21:23:23 GMT+0100 (Midden-Europese standaardtijd)'),
('osm_744393123', 'occupied', 'Sun Mar 09 2025 20:23:24 GMT+0100 (Midden-Europese standaardtijd)'),
('osm_744393123', 'vacated', 'Sun Mar 09 2025 21:23:24 GMT+0100 (Midden-Europese standaardtijd)'),
('osm_1189832668', 'occupied', 'Sun Mar 09 2025 20:23:25 GMT+0100 (Midden-Europese standaardtijd)'),
('osm_1189832668', 'vacated', 'Sun Mar 09 2025 21:23:25 GMT+0100 (Midden-Europese standaardtijd)'),
('osm_1348516590', 'occupied', 'Sun Mar 09 2025 20:23:26 GMT+0100 (Midden-Europese standaardtijd)'),
('osm_1348516590', 'vacated', 'Sun Mar 09 2025 21:23:26 GMT+0100 (Midden-Europese standaardtijd)');

-- Verify the setup
SELECT 'Parking usage history table recreated!' as status;
SELECT COUNT(*) as total_usage_records FROM public.parking_usage_history;
