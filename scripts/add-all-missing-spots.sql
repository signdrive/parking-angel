-- Add all missing parking spots from the error logs

-- Add the new missing spot IDs
INSERT INTO public.parking_spots (id, latitude, longitude, spot_type, address, is_available) VALUES
-- New missing spots from the latest error logs
('google_ChIJU93pfJBRw0cRX73m9xyf0ss', 52.3740, 4.9110, 'street', 'Amsterdam Centrum', true),
('google_ChIJgbwWjqBRw0cRm3VVoRXy17Q', 52.3741, 4.9111, 'street', 'Amsterdam Nieuwmarkt', true),
('google_ChIJOYPegYZRw0cRg9gUI8wg_Hw', 52.3742, 4.9112, 'garage', 'Amsterdam Waterlooplein', true),
('osm_229872456', 52.3743, 4.9113, 'lot', 'Amsterdam Oosterdok', true),
('osm_575320830', 52.3744, 4.9114, 'street', 'Amsterdam Plantage', false),
('osm_575358966', 52.3745, 4.9115, 'garage', 'Amsterdam Artis', true),
('osm_564423852', 52.3746, 4.9116, 'street', 'Amsterdam Weesperplein', true),
('osm_968181917', 52.3747, 4.9117, 'lot', 'Amsterdam Amstel', true),
('osm_582273949', 52.3748, 4.9118, 'street', 'Amsterdam Rembrandtplein', true),
('osm_673202567', 52.3749, 4.9119, 'garage', 'Amsterdam Muntplein', false),
('osm_1180649490', 52.3750, 4.9120, 'street', 'Amsterdam Spui', true),
('osm_1180649499', 52.3751, 4.9121, 'lot', 'Amsterdam Singel', true),
('osm_1180649506', 52.3752, 4.9122, 'street', 'Amsterdam Herengracht', true),
('osm_835109155', 52.3753, 4.9123, 'garage', 'Amsterdam Keizersgracht', false),
('osm_1180747446', 52.3754, 4.9124, 'street', 'Amsterdam Prinsengracht', true),
('osm_1180747450', 52.3755, 4.9125, 'lot', 'Amsterdam Jordaan', true),
('osm_1180747459', 52.3756, 4.9126, 'street', 'Amsterdam Rozengracht', true)
ON CONFLICT (id) DO UPDATE SET
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    spot_type = EXCLUDED.spot_type,
    address = EXCLUDED.address,
    is_available = EXCLUDED.is_available,
    updated_at = NOW();

-- Add sample usage history for these spots
INSERT INTO public.parking_usage_history (spot_id, action, "timestamp") VALUES
('google_ChIJU93pfJBRw0cRX73m9xyf0ss', 'occupied', 'Sun Mar 09 2025 20:23:30 GMT+0100 (Midden-Europese standaardtijd)'),
('google_ChIJU93pfJBRw0cRX73m9xyf0ss', 'vacated', 'Sun Mar 09 2025 21:23:30 GMT+0100 (Midden-Europese standaardtijd)'),
('google_ChIJgbwWjqBRw0cRm3VVoRXy17Q', 'occupied', 'Sun Mar 09 2025 20:23:31 GMT+0100 (Midden-Europese standaardtijd)'),
('google_ChIJgbwWjqBRw0cRm3VVoRXy17Q', 'vacated', 'Sun Mar 09 2025 21:23:31 GMT+0100 (Midden-Europese standaardtijd)'),
('osm_229872456', 'occupied', 'Sun Mar 09 2025 20:23:32 GMT+0100 (Midden-Europese standaardtijd)'),
('osm_229872456', 'vacated', 'Sun Mar 09 2025 21:23:32 GMT+0100 (Midden-Europese standaardtijd)'),
('osm_673202567', 'occupied', 'Sun Mar 09 2025 20:23:33 GMT+0100 (Midden-Europese standaardtijd)'),
('osm_673202567', 'vacated', 'Sun Mar 09 2025 21:23:33 GMT+0100 (Midden-Europese standaardtijd)'),
('osm_1180649490', 'occupied', 'Sun Mar 09 2025 20:23:34 GMT+0100 (Midden-Europese standaardtijd)'),
('osm_1180649490', 'vacated', 'Sun Mar 09 2025 21:23:34 GMT+0100 (Midden-Europese standaardtijd)');

-- Create a function to handle the last_updated field
CREATE OR REPLACE FUNCTION public.get_spot_availability(
    spot_id_param TEXT
)
RETURNS TABLE (
    id TEXT,
    is_available BOOLEAN,
    last_updated TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ps.id,
        ps.is_available,
        ps.updated_at as last_updated
    FROM public.parking_spots ps
    WHERE ps.id = spot_id_param;
END;
$$ LANGUAGE plpgsql;

-- Create a view to simplify queries
CREATE OR REPLACE VIEW public.parking_spots_view AS
SELECT 
    id,
    latitude,
    longitude,
    spot_type,
    address,
    is_available,
    updated_at as last_updated
FROM public.parking_spots;

-- Grant permissions on the view
GRANT SELECT ON public.parking_spots_view TO authenticated, anon;

-- Verify the setup
SELECT 'All missing spots added!' as status;
SELECT COUNT(*) as total_spots FROM public.parking_spots;
