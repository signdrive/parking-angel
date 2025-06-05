-- Insert sample data for testing (optional)

-- Sample AI predictions
INSERT INTO public.ai_predictions (location, prediction_type, prediction_data, confidence_score, valid_until) VALUES
(ST_SetSRID(ST_MakePoint(-122.4194, 37.7749), 4326)::geography, 'demand_forecast', '{"peak_hours": ["8-10", "17-19"], "availability": 0.3}', 0.85, NOW() + INTERVAL '24 hours'),
(ST_SetSRID(ST_MakePoint(-122.4094, 37.7849), 4326)::geography, 'price_prediction', '{"predicted_price": 4.50, "trend": "increasing"}', 0.78, NOW() + INTERVAL '12 hours'),
(ST_SetSRID(ST_MakePoint(-122.4294, 37.7649), 4326)::geography, 'availability_forecast', '{"probability": 0.92, "best_time": "14:00"}', 0.91, NOW() + INTERVAL '6 hours');

-- Sample system configuration
INSERT INTO public.ai_predictions (location, prediction_type, prediction_data, confidence_score, valid_until) VALUES
(ST_SetSRID(ST_MakePoint(0, 0), 4326)::geography, 'system_config', '{"max_spot_duration": 240, "cleanup_interval": 5, "reputation_thresholds": {"bronze": 100, "silver": 500, "gold": 1000}}', 1.0, NOW() + INTERVAL '1 year');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_predictions_type ON public.ai_predictions (prediction_type);
CREATE INDEX IF NOT EXISTS idx_ai_predictions_valid_until ON public.ai_predictions (valid_until);
CREATE INDEX IF NOT EXISTS idx_profiles_reputation ON public.profiles (reputation_score DESC);
CREATE INDEX IF NOT EXISTS idx_parking_spots_price ON public.parking_spots (price_per_hour);
CREATE INDEX IF NOT EXISTS idx_spot_reports_created_at ON public.spot_reports (created_at DESC);
