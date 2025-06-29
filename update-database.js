// Script to update the database schema by adding required columns to profiles table
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateDatabaseSchema() {
  console.log('Starting database schema update...');

  try {
    // Create subscription_tier enum if it doesn't exist
    const { error: enumError } = await supabase.rpc('create_subscription_tier_enum');
    if (enumError) {
      console.log('Note: Enum may already exist or other issue:', enumError.message);
    } else {
      console.log('Created subscription_tier enum');
    }

    // Run SQL query to add columns to profiles table
    const { error } = await supabase.rpc('add_subscription_columns');
    if (error) {
      console.error('Error adding columns:', error);
      return;
    }
    console.log('Successfully added columns to profiles table');

    // Test by getting a profile
    const { data, error: fetchError } = await supabase
      .from('profiles')
      .select('subscription_tier, subscription_status, stripe_customer_id')
      .limit(1);

    if (fetchError) {
      console.error('Error fetching profile:', fetchError);
      return;
    }

    console.log('Sample profile data:', data);
    console.log('Schema update complete!');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Create the SQL functions first
async function createHelperFunctions() {
  console.log('Creating helper functions...');

  // Function to create enum
  const createEnumFunction = `
  CREATE OR REPLACE FUNCTION create_subscription_tier_enum()
  RETURNS void AS $$
  BEGIN
    CREATE TYPE subscription_tier AS ENUM ('free', 'premium', 'pro', 'enterprise');
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
  $$ LANGUAGE plpgsql;
  `;

  // Function to add columns
  const addColumnsFunction = `
  CREATE OR REPLACE FUNCTION add_subscription_columns()
  RETURNS void AS $$
  DECLARE
    enum_exists boolean;
  BEGIN
    -- Check if enum exists
    SELECT EXISTS (
      SELECT 1 FROM pg_type WHERE typname = 'subscription_tier'
    ) INTO enum_exists;
    
    -- Create enum if it doesn't exist
    IF NOT enum_exists THEN
      CREATE TYPE subscription_tier AS ENUM ('free', 'premium', 'pro', 'enterprise');
    END IF;
    
    -- Add columns if they don't exist
    BEGIN
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_tier subscription_tier DEFAULT 'free' NOT NULL;
    EXCEPTION WHEN duplicate_column THEN NULL;
    END;
    
    BEGIN
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'inactive' NOT NULL;
    EXCEPTION WHEN duplicate_column THEN NULL;
    END;
    
    BEGIN
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id text;
    EXCEPTION WHEN duplicate_column THEN NULL;
    END;
    
    -- Update any values that need mapping
    UPDATE profiles SET subscription_tier = 'premium' WHERE subscription_tier::text = 'navigator';
    UPDATE profiles SET subscription_tier = 'pro' WHERE subscription_tier::text = 'pro_parker';
    UPDATE profiles SET subscription_tier = 'enterprise' WHERE subscription_tier::text = 'fleet_manager';
  END;
  $$ LANGUAGE plpgsql;
  `;

  try {
    // Create the enum function
    const { error: enumFuncError } = await supabase.rpc('create_subscription_tier_enum', {}, { count: 'exact' }).catch(() => {
      return supabase.sql(createEnumFunction);
    });

    if (enumFuncError) {
      console.log('Creating enum function:', enumFuncError);
      await supabase.sql(createEnumFunction);
    }

    // Create the columns function
    const { error: colFuncError } = await supabase.rpc('add_subscription_columns', {}, { count: 'exact' }).catch(() => {
      return supabase.sql(addColumnsFunction);
    });

    if (colFuncError) {
      console.log('Creating columns function:', colFuncError);
      await supabase.sql(addColumnsFunction);
    }

    console.log('Helper functions created successfully');
    return true;
  } catch (error) {
    console.error('Error creating helper functions:', error);
    return false;
  }
}

// Execute the updates
async function run() {
  const functionsCreated = await createHelperFunctions();
  if (functionsCreated) {
    await updateDatabaseSchema();
  } else {
    console.error('Failed to create helper functions. Aborting.');
  }
}

run();
