-- Enable real-time subscriptions for Supabase
-- Run this in the Supabase SQL Editor

-- Enable real-time for parking_spots table
ALTER PUBLICATION supabase_realtime ADD TABLE public.parking_spots;

-- Enable real-time for spot_reports table  
ALTER PUBLICATION supabase_realtime ADD TABLE public.spot_reports;

-- Enable real-time for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Enable real-time for user_activities table
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_activities;

-- Enable real-time for ai_predictions table
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_predictions;

-- Test the cleanup function
SELECT cleanup_expired_spots() as deleted_spots_count;

-- Test the nearby spots function with San Francisco coordinates
SELECT * FROM find_nearby_spots(37.7749, -122.4194, 1000) LIMIT 5;

-- Test the parking demand calculation
SELECT * FROM calculate_parking_demand(37.7749, -122.4194, 1000);

-- Verify real-time is enabled
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- Create a test notification to verify the system
INSERT INTO public.notifications (
    user_id,
    title,
    message,
    notification_type,
    data
) VALUES (
    NULL,
    'System Test',
    'Real-time setup completed successfully!',
    'success',
    jsonb_build_object(
        'test', true, 
        'timestamp', NOW(),
        'setup_type', 'realtime'
    )
);

-- Show recent notifications
SELECT 
    id,
    title,
    message,
    notification_type,
    created_at
FROM public.notifications 
ORDER BY created_at DESC 
LIMIT 5;

-- Show enabled real-time tables
SELECT 
    'Real-time enabled for: ' || string_agg(tablename, ', ') as enabled_tables
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public';

-- Test user reputation function (if you have a user)
-- Replace 'your-user-id' with an actual user ID from auth.users
-- SELECT update_user_reputation('your-user-id', 10);

-- Show function test results
SELECT 'Real-time setup completed successfully!' as status;
