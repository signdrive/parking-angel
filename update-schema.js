// Simpler script to run SQL directly
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateSchema() {
  try {
    console.log('Starting schema update...');

    // Create enum
    console.log('Creating subscription_tier enum if it doesn\'t exist...');
    const createEnumSQL = `
    DO $$ 
    BEGIN
      CREATE TYPE subscription_tier AS ENUM ('free', 'premium', 'pro', 'enterprise');
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
    `;
    await supabase.from('_sql').rpc('invoke', { query: createEnumSQL });
    console.log('Enum created or already exists');

    // Add columns
    console.log('Adding columns to profiles table...');
    const addColumnsSQL = `
    DO $$ 
    BEGIN
      -- Add subscription_tier column if it doesn't exist
      BEGIN
        ALTER TABLE profiles ADD COLUMN subscription_tier subscription_tier DEFAULT 'free'::subscription_tier NOT NULL;
      EXCEPTION
        WHEN duplicate_column THEN NULL;
      END;
      
      -- Add subscription_status column if it doesn't exist
      BEGIN
        ALTER TABLE profiles ADD COLUMN subscription_status text DEFAULT 'inactive' NOT NULL;
      EXCEPTION
        WHEN duplicate_column THEN NULL;
      END;
      
      -- Add stripe_customer_id column if it doesn't exist
      BEGIN
        ALTER TABLE profiles ADD COLUMN stripe_customer_id text;
      EXCEPTION
        WHEN duplicate_column THEN NULL;
      END;
    END $$;
    `;
    await supabase.from('_sql').rpc('invoke', { query: addColumnsSQL });
    console.log('Columns added or already exist');

    // Update existing values if needed
    console.log('Updating any existing values...');
    const updateValuesSQL = `
    -- Update any 'navigator' values to 'premium' if they exist
    UPDATE profiles 
    SET subscription_tier = 'premium'::subscription_tier 
    WHERE subscription_tier::text = 'navigator';

    -- Update any 'pro_parker' values to 'pro' if they exist
    UPDATE profiles 
    SET subscription_tier = 'pro'::subscription_tier 
    WHERE subscription_tier::text = 'pro_parker';

    -- Update any 'fleet_manager' values to 'enterprise' if they exist
    UPDATE profiles 
    SET subscription_tier = 'enterprise'::subscription_tier 
    WHERE subscription_tier::text = 'fleet_manager';
    `;
    await supabase.from('_sql').rpc('invoke', { query: updateValuesSQL });
    console.log('Values updated');

    // Test by getting a profile
    console.log('Testing schema update...');
    const { data, error } = await supabase
      .from('profiles')
      .select('id, subscription_tier, subscription_status')
      .limit(1);

    if (error) {
      console.error('Error fetching profiles:', error);
    } else {
      console.log('Sample profile data:', data);
      console.log('Schema update successful!');
    }

  } catch (error) {
    console.error('Error updating schema:', error);
  }
}

updateSchema();
