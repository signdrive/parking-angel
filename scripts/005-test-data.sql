-- Insert test data to verify the system works

-- Note: This will only work if you have a user authenticated
-- You can run this after signing up through the app

-- Test parking spots (replace with actual coordinates for your area)
INSERT INTO public.parking_spots (
    latitude, 
    longitude, 
    location,
    address, 
    spot_type, 
    price_per_hour,
    max_duration_hours,
    restrictions
) VALUES 
(
    37.7749, 
    -122.4194,
    ST_SetSRID(ST_MakePoint(-122.4194, 37.7749), 4326)::geography,
    'Downtown San Francisco', 
    'street',
    3.50,
    2,
    ARRAY['No overnight parking', 'Street cleaning Tue 8-10am']
),
(
    37.7849, 
    -122.4094,
    ST_SetSRID(ST_MakePoint(-122.4094, 37.7849), 4326)::geography,
    'Union Square Area', 
    'garage',
    8.00,
    24,
    ARRAY['Validation available']
),
(
    37.7649, 
    -122.4294,
    ST_SetSRID(ST_MakePoint(-122.4294, 37.7649), 4326)::geography,
    'Mission District', 
    'meter',
    2.00,
    4,
    ARRAY['2 hour limit', 'Enforced 9am-6pm']
);

-- Test AI predictions with more realistic data
INSERT INTO public.ai_predictions (
    location, 
    prediction_type, 
    prediction_data, 
    confidence_score, 
    valid_until
) VALUES 
(
    ST_SetSRID(ST_MakePoint(-122.4194, 37.7749), 4326)::geography,
    'demand_forecast',
    '{
        "peak_hours": ["8:00-10:00", "17:00-19:00"],
        "availability_probability": 0.3,
        "recommended_arrival": "14:00",
        "price_trend": "stable"
    }'::jsonb,
    0.87,
    NOW() + INTERVAL '24 hours'
),
(
    ST_SetSRID(ST_MakePoint(-122.4094, 37.7849), 4326)::geography,
    'price_prediction',
    '{
        "current_price": 8.00,
        "predicted_price": 9.50,
        "price_change": "+18.75%",
        "factors": ["high_demand", "event_nearby", "weekend"]
    }'::jsonb,
    0.92,
    NOW() + INTERVAL '12 hours'
),
(
    ST_SetSRID(ST_MakePoint(-122.4294, 37.7649), 4326)::geography,
    'availability_forecast',
    '{
        "probability": 0.78,
        "best_times": ["11:00-13:00", "15:00-16:00"],
        "worst_times": ["8:00-9:00", "18:00-19:00"],
        "confidence": "high"
    }'::jsonb,
    0.78,
    NOW() + INTERVAL '6 hours'
);

-- Test the enhanced find_nearby_spots function
SELECT 'Testing enhanced nearby spots search...' as test_name;

-- Find all spots within 2km of downtown SF
SELECT 
    address,
    spot_type,
    distance_meters,
    price_per_hour,
    confidence_score,
    avg_rating
FROM find_nearby_spots(37.7749, -122.4194, 2000)
ORDER BY distance_meters;

-- Test with filters
SELECT 'Testing filtered search (street parking under $5)...' as test_name;

SELECT 
    address,
    spot_type,
    price_per_hour,
    distance_meters
FROM find_nearby_spots(37.7749, -122.4194, 2000, 'street', 5.00)
ORDER BY price_per_hour;

-- Test demand calculation
SELECT 'Testing demand calculation...' as test_name;

SELECT 
    total_spots,
    available_spots,
    demand_ratio,
    avg_confidence
FROM calculate_parking_demand(37.7749, -122.4194, 2000);
