-- Create smart_alerts table
CREATE TABLE smart_alerts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_type text NOT NULL CHECK (alert_type IN ('parking_available', 'time_expiring', 'restriction_change', 'price_change', 'event_nearby')),
  location jsonb NOT NULL,
  radius integer DEFAULT 500 CHECK (radius > 0),
  conditions jsonb,
  preferences jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  last_triggered timestamp with time zone,
  trigger_count integer DEFAULT 0
);

-- Create alert_notifications table
CREATE TABLE alert_notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_id uuid NOT NULL REFERENCES smart_alerts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb,
  sent_at timestamp with time zone DEFAULT now(),
  read_at timestamp with time zone,
  action_taken boolean DEFAULT false
);

-- Create indexes
CREATE INDEX idx_smart_alerts_user_id ON smart_alerts(user_id);
CREATE INDEX idx_smart_alerts_alert_type ON smart_alerts(alert_type);
CREATE INDEX idx_smart_alerts_location ON smart_alerts USING gin(location);
CREATE INDEX idx_smart_alerts_active ON smart_alerts(is_active) WHERE is_active = true;

CREATE INDEX idx_alert_notifications_alert_id ON alert_notifications(alert_id);
CREATE INDEX idx_alert_notifications_user_id ON alert_notifications(user_id);
CREATE INDEX idx_alert_notifications_sent_at ON alert_notifications(sent_at DESC);

-- Enable RLS
ALTER TABLE smart_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for smart_alerts
CREATE POLICY "Users can view their own alerts" ON smart_alerts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own alerts" ON smart_alerts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own alerts" ON smart_alerts FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own alerts" ON smart_alerts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Create policies for alert_notifications
CREATE POLICY "Users can view their own notifications" ON alert_notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON alert_notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Create trigger for smart_alerts updated_at
CREATE TRIGGER update_smart_alerts_updated_at BEFORE UPDATE ON smart_alerts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
