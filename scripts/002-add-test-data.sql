-- Add test data to verify everything works

-- Insert test profiles (these will be created automatically when users sign up)
-- We'll just add some test parking spots

INSERT INTO public.parking_spots (
    latitude, longitude, address, spot_type, is_available, 
    price_per_hour, max_duration_hours, notes
) VALUES 
(51.5074, -0.1278, 'Westminster, London', 'street', true, 2.50, 2, 'Near Big Ben'),
(51.5155, -0.0922, 'City of London', 'garage', true, 4.00, 24, 'Secure underground parking'),
(51.5007, -0.1246, 'South Bank, London', 'meter', true, 3.00, 4, 'Pay and display'),
(51.5194, -0.1270, 'Fitzrovia, London', 'lot', false, 2.00, 8, 'Currently full'),
(51.5033, -0.1195, 'Waterloo, London', 'street', true, 1.50, 3, 'Free after 6pm');

-- Test the functions
SELECT 'Testing find_nearby_spots function:' as test_name;
SELECT * FROM find_nearby_spots(51.5074, -0.1278, 1000);

SELECT 'Testing calculate_parking_demand function:' as test_name;
SELECT * FROM calculate_parking_demand(51.5074, -0.1278, 2000);

SELECT 'Testing cleanup_expired_spots function:' as test_name;
SELECT cleanup_expired_spots();

-- Verify tables exist and have data
SELECT 'Parking spots count:' as info, COUNT(*) as count FROM public.parking_spots;
SELECT 'User activities count:' as info, COUNT(*) as count FROM public.user_activities;
SELECT 'Profiles count:' as info, COUNT(*) as count FROM public.profiles;

-- Test that the location column is working
SELECT 'Location column test:' as info, 
       id, latitude, longitude, 
       ST_AsText(location::geometry) as location_wkt
FROM public.parking_spots 
LIMIT 3;
