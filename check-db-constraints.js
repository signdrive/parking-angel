import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkDatabaseConstraints() {
  console.log('🔍 Checking database constraints...\n');
  
  try {
    // Check user_subscriptions table constraints
    console.log('1️⃣ Checking user_subscriptions table constraints...');
    
    const { data: constraints, error } = await supabase
      .rpc('get_table_constraints', { table_name: 'user_subscriptions' });
    
    if (error) {
      console.log('Using alternative method to check constraints...');
      
      // Alternative: Check the table definition
      const { data: tableInfo } = await supabase
        .from('information_schema.columns')
        .select('*')
        .eq('table_name', 'user_subscriptions')
        .eq('column_name', 'plan_id');
      
      console.log('Table info:', tableInfo);
    } else {
      console.log('Constraints:', constraints);
    }
    
    // Check profiles table enum values
    console.log('\n2️⃣ Checking profiles table enum values...');
    
    const { data: enumValues } = await supabase
      .rpc('get_enum_values', { enum_name: 'subscription_tier' });
    
    if (enumValues) {
      console.log('subscription_tier enum values:', enumValues);
    }
    
  } catch (error) {
    console.error('🚨 Error checking database constraints:', error);
  }
}

checkDatabaseConstraints();
