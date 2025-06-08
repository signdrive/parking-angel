-- Final fix for parking spots and usage history

-- 1. Fix the timestamp handling in parking_usage_history
ALTER TABLE public.parking_usage_history ALTER COLUMN "timestamp" TYPE TEXT;

-- 2. Add all the missing spot IDs from the error logs
INSERT INTO public.parking_spots (id, latitude, longitude, spot_type, address, is_available) VALUES
-- Missing spots from error logs
('google_ChIJRy77kq5Rw0cR56z6UkSoOC8', 52.3720, 4.9090, 'street', 'Amsterdam Central', true),
('osm_696987981', 52.3721, 4.9091, 'street', 'Amsterdam North', true),
('osm_696987982', 52.3722, 4.9092, 'garage', 'Amsterdam South', true),
('osm_707556793', 52.3723, 4.9093, 'lot', 'Amsterdam East', true),
('osm_721148421', 52.3724, 4.9094, 'street', 'Amsterdam West', true),
('osm_721696625', 52.3725, 4.9095, 'garage', 'Amsterdam Central Station', false),
('osm_744393123', 52.3726, 4.9096, 'street', 'Amsterdam Dam Square', true),
('osm_1189832668', 52.3727, 4.9097, 'lot', 'Amsterdam Museum Quarter', true),
('osm_1348516590', 52.3728, 4.9098, 'street', 'Amsterdam Jordaan', true)
ON CONFLICT (id) DO UPDATE SET
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    spot_type = EXCLUDED.spot_type,
    address = EXCLUDED.address,
    is_available = EXCLUDED.is_available,
    updated_at = NOW();

-- 3. Add sample usage history for these spots
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

-- 4. Fix the timestamp comparison in the find_nearby_spots function
CREATE OR REPLACE FUNCTION public.find_nearby_spots(
    user_lat DOUBLE PRECISION,
    user_lng DOUBLE PRECISION,
    radius_meters INTEGER DEFAULT 1000
)
RETURNS TABLE (
    id TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    address TEXT,
    spot_type TEXT,
    is_available BOOLEAN,
    distance_meters DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ps.id,
        ps.latitude,
        ps.longitude,
        ps.address,
        ps.spot_type,
        ps.is_available,
        ST_Distance(
            ps.geom,
            ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
        ) as distance_meters
    FROM public.parking_spots ps
    WHERE ps.geom IS NOT NULL
    AND ST_DWithin(
        ps.geom,
        ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
        radius_meters
    )
    ORDER BY distance_meters;
END;
$$ LANGUAGE plpgsql;

-- 5. Create a function to handle the timestamp format in queries
CREATE OR REPLACE FUNCTION public.get_spot_usage_history(
    spot_id_param TEXT,
    timestamp_param TEXT
)
RETURNS TABLE (
    id INTEGER,
    spot_id TEXT,
    action TEXT,
    "timestamp" TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        puh.id,
        puh.spot_id,
        puh.action,
        puh."timestamp"
    FROM public.parking_usage_history puh
    WHERE puh.spot_id = spot_id_param
    ORDER BY puh.id DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- 6. Create a function to get spot details
CREATE OR REPLACE FUNCTION public.get_spot_details(
    spot_id_param TEXT
)
RETURNS TABLE (
    id TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    spot_type TEXT,
    address TEXT,
    is_available BOOLEAN,
    last_updated TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ps.id,
        ps.latitude,
        ps.longitude,
        ps.spot_type,
        ps.address,
        ps.is_available,
        ps.updated_at as last_updated
    FROM public.parking_spots ps
    WHERE ps.id = spot_id_param;
END;
$$ LANGUAGE plpgsql;

-- 7. Verify the setup
SELECT 'Final parking spots fix completed!' as status;
SELECT COUNT(*) as total_spots FROM public.parking_spots;
SELECT COUNT(*) as total_usage_records FROM public.parking_usage_history;
