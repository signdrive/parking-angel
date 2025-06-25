-- Missing A/B Testing Tables that ExperimentManager expects

CREATE TABLE IF NOT EXISTS ab_experiment_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID NOT NULL REFERENCES ab_experiments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  traffic_percentage DECIMAL NOT NULL DEFAULT 0,
  config JSONB DEFAULT '{}',
  is_control BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ab_user_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Use TEXT to support both UUID and session IDs
  experiment_id UUID NOT NULL REFERENCES ab_experiments(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES ab_experiment_variants(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  converted BOOLEAN DEFAULT false,
  conversion_value DECIMAL,
  UNIQUE(user_id, experiment_id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ab_experiment_variants_experiment ON ab_experiment_variants(experiment_id);
CREATE INDEX IF NOT EXISTS idx_ab_user_assignments_user_experiment ON ab_user_assignments(user_id, experiment_id);
CREATE INDEX IF NOT EXISTS idx_ab_user_assignments_variant ON ab_user_assignments(variant_id);

-- Row Level Security (RLS) Policies
ALTER TABLE ab_experiment_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_user_assignments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Admin can manage ab_experiment_variants" ON ab_experiment_variants;
DROP POLICY IF EXISTS "Admin can view ab_user_assignments" ON ab_user_assignments;
DROP POLICY IF EXISTS "Users can view their own ab_user_assignments" ON ab_user_assignments;
DROP POLICY IF EXISTS "Users can insert their own ab_user_assignments" ON ab_user_assignments;
DROP POLICY IF EXISTS "Users can update their own ab_user_assignments" ON ab_user_assignments;

-- Policies for admin access
CREATE POLICY "Admin can manage ab_experiment_variants" ON ab_experiment_variants
FOR ALL USING (EXISTS (
  SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));

CREATE POLICY "Admin can view ab_user_assignments" ON ab_user_assignments
FOR SELECT USING (EXISTS (
  SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));

-- Policies for user data access  
CREATE POLICY "Users can view their own ab_user_assignments" ON ab_user_assignments
FOR SELECT USING (
  user_id = auth.uid()::text OR
  (auth.uid() IS NULL AND user_id IS NOT NULL) -- Allow anonymous users to see their session-based assignments
);

CREATE POLICY "Users can insert their own ab_user_assignments" ON ab_user_assignments
FOR INSERT WITH CHECK (
  user_id = auth.uid()::text OR
  (auth.uid() IS NULL AND user_id IS NOT NULL) -- Allow anonymous users to create session-based assignments
);

CREATE POLICY "Users can update their own ab_user_assignments" ON ab_user_assignments
FOR UPDATE USING (
  user_id = auth.uid()::text OR
  (auth.uid() IS NULL AND user_id IS NOT NULL) -- Allow anonymous users to update their session-based assignments
);

-- Create a view for experiment results that the ExperimentManager expects
CREATE OR REPLACE VIEW ab_experiment_results_view AS
SELECT 
  v.id as variant_id,
  v.name,
  v.is_control,
  COUNT(DISTINCT ua.user_id) as users,
  COUNT(DISTINCT CASE WHEN ua.converted = true THEN ua.user_id END) as conversions,
  COALESCE(COUNT(DISTINCT CASE WHEN ua.converted = true THEN ua.user_id END)::float / NULLIF(COUNT(DISTINCT ua.user_id), 0), 0) as conversion_rate,
  COALESCE(AVG(ua.conversion_value) FILTER (WHERE ua.converted = true), 0) as average_value,
  e.id as experiment_id
FROM ab_experiments e
LEFT JOIN ab_experiment_variants v ON e.id = v.experiment_id
LEFT JOIN ab_user_assignments ua ON v.id = ua.variant_id
GROUP BY e.id, v.id, v.name, v.is_control;
