-- Insert sample parking spots (adjust coordinates to your area of interest)
-- These are centered around San Francisco for demonstration
INSERT INTO public.parking_spots (latitude, longitude, address, spot_type, is_available, expires_at, confidence_score)
VALUES
    (37.7749, -122.4194, '123 Market St, San Francisco', 'street', true, NOW() + INTERVAL '30 minutes', 95),
    (37.7750, -122.4180, '456 Mission St, San Francisco', 'meter', true, NOW() + INTERVAL '45 minutes', 90),
    (37.7765, -122.4200, '789 Howard St, San Francisco', 'garage', true, NOW() + INTERVAL '2 hours', 98),
    (37.7730, -122.4170, '321 Folsom St, San Francisco', 'lot', true, NOW() + INTERVAL '1 hour', 85),
    (37.7720, -122.4150, '555 Harrison St, San Francisco', 'street', true, NOW() + INTERVAL '20 minutes', 80);

-- Note: The location field will be automatically set by the trigger we created
