-- Insert some test parking spots
INSERT INTO public.parking_spots (
    latitude, longitude, address, spot_type, is_available, 
    price_per_hour, max_duration_hours, confidence_score
) VALUES 
-- San Francisco test spots
(37.7749, -122.4194, '123 Market St, San Francisco, CA', 'street', true, 2.50, 2, 95),
(37.7849, -122.4094, '456 Mission St, San Francisco, CA', 'meter', true, 4.00, 4, 90),
(37.7949, -122.3994, '789 Howard St, San Francisco, CA', 'garage', false, 8.00, 24, 85),
(37.7649, -122.4294, '321 Folsom St, San Francisco, CA', 'lot', true, 6.00, 8, 92),

-- New York test spots
(40.7580, -73.9855, '1515 Broadway, New York, NY', 'garage', true, 12.00, 24, 88),
(40.7829, -73.9654, 'Central Park West, New York, NY', 'meter', false, 5.00, 2, 75),

-- London test spots
(51.5074, -0.1278, 'Westminster Bridge Rd, London, UK', 'street', true, 3.50, 4, 80),
(51.5155, -0.0922, 'Tower Bridge Rd, London, UK', 'lot', true, 5.00, 12, 85)

ON CONFLICT DO NOTHING;

-- Test the function
SELECT 'Testing find_nearby_spots function:' as test_message;
SELECT * FROM find_nearby_spots(37.7749, -122.4194, 5000) LIMIT 5;

SELECT 'Testing calculate_parking_demand function:' as test_message;
SELECT * FROM calculate_parking_demand(37.7749, -122.4194, 5000);

SELECT 'Testing cleanup_expired_spots function:' as test_message;
SELECT cleanup_expired_spots() as deleted_count;
