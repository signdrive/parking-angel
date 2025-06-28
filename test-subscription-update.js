require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

const testSubscriptionUpdate = async () => {
  try {
    // Test data using a UUID for user_id
    const testData = {
      id: require('crypto').randomUUID(),
      user_id: require('crypto').randomUUID(),
      plan_id: 'navigator',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('Testing subscription update with:', testData);

    // First verify connection
    const { error: healthError } = await supabase.from('user_subscriptions').select('count').limit(1);
    if (healthError) {
      throw new Error(`Database connection failed: ${healthError.message}`);
    }
    console.log('✅ Database connection verified');

    // Attempt the upsert
    const { data, error } = await supabase
      .from('user_subscriptions')
      .upsert(testData);

    if (error) {
      console.error('❌ Error updating subscription:', error);
      process.exit(1);
    } else {
      console.log('✅ Subscription updated successfully:', data);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
};

testSubscriptionUpdate();
