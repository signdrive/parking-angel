-- Enable real-time subscriptions for Supabase (Fixed version)
-- Run this AFTER running the table creation/fix script

-- First, check what tables exist
SELECT 'Checking existing tables...' as status;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Enable real-time for tables that exist
DO $$
DECLARE
    table_exists boolean;
BEGIN
    -- Check and enable real-time for parking_spots
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'parking_spots'
    ) INTO table_exists;
    
    IF table_exists THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.parking_spots;
        RAISE NOTICE 'Real-time enabled for parking_spots';
    ELSE
        RAISE NOTICE 'Table parking_spots does not exist';
    END IF;

    -- Check and enable real-time for spot_reports
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'spot_reports'
    ) INTO table_exists;
    
    IF table_exists THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.spot_reports;
        RAISE NOTICE 'Real-time enabled for spot_reports';
    ELSE
        RAISE NOTICE 'Table spot_reports does not exist';
    END IF;

    -- Check and enable real-time for notifications
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'notifications'
    ) INTO table_exists;
    
    IF table_exists THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
        RAISE NOTICE 'Real-time enabled for notifications';
    ELSE
        RAISE NOTICE 'Table notifications does not exist';
    END IF;

    -- Check and enable real-time for user_activities
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'user_activities'
    ) INTO table_exists;
    
    IF table_exists THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.user_activities;
        RAISE NOTICE 'Real-time enabled for user_activities';
    ELSE
        RAISE NOTICE 'Table user_activities does not exist';
    END IF;

    -- Check and enable real-time for ai_predictions
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'ai_predictions'
    ) INTO table_exists;
    
    IF table_exists THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_predictions;
        RAISE NOTICE 'Real-time enabled for ai_predictions';
    ELSE
        RAISE NOTICE 'Table ai_predictions does not exist';
    END IF;
END $$;

-- Test functions only if they exist
DO $$
DECLARE
    func_exists boolean;
BEGIN
    -- Test cleanup function
    SELECT EXISTS (
        SELECT FROM information_schema.routines 
        WHERE routine_schema = 'public' AND routine_name = 'cleanup_expired_spots'
    ) INTO func_exists;
    
    IF func_exists THEN
        PERFORM cleanup_expired_spots();
        RAISE NOTICE 'Cleanup function tested successfully';
    ELSE
        RAISE NOTICE 'Cleanup function does not exist';
    END IF;
END $$;

-- Verify real-time is enabled
SELECT 'Real-time enabled for these tables:' as status;
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public'
ORDER BY tablename;

-- Create a test notification if the table exists
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'notifications'
    ) THEN
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
        RAISE NOTICE 'Test notification created';
    END IF;
END $$;

-- Show setup completion status
SELECT 'Real-time setup process completed!' as final_status;
