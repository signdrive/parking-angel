#!/usr/bin/env node

// Test for spot reports table operations
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Missing Supabase environment variables');
  console.log('💡 Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSpotReportsTable() {
  console.log('🧪 Testing Spot Reports Table Operations...\n');

  // Test 1: Check if table exists and has correct structure
  console.log('1. Testing table structure...');
  try {
    const { data, error } = await supabase
      .from('spot_reports')
      .select('*')
      .limit(1);

    if (error) {
      console.log('   ❌ Table access failed:', error.message);
      return;
    }

    console.log('   ✅ spot_reports table accessible');
  } catch (error) {
    console.log('   ❌ Database connection failed:', error.message);
    return;
  }

  // Test 2: Insert a test report
  console.log('\n2. Testing report insertion...');
  const testReport = {
    spot_id: 'test-spot-' + Date.now(),
    reporter_id: 'test-user-' + Date.now(),
    report_type: 'new_spot',
    notes: 'Test report from automated testing',
    status: 'pending'
  };

  try {
    const { data, error } = await supabase
      .from('spot_reports')
      .insert(testReport)
      .select()
      .single();

    if (error) {
      console.log('   ❌ Insert failed:', error.message);
    } else {
      console.log('   ✅ Report inserted successfully');
      console.log('   📋 Report ID:', data.id);
      
      // Test 3: Update the report
      console.log('\n3. Testing report update...');
      const { data: updateData, error: updateError } = await supabase
        .from('spot_reports')
        .update({ 
          status: 'approved',
          notes: 'Updated test report'
        })
        .eq('id', data.id)
        .select()
        .single();

      if (updateError) {
        console.log('   ❌ Update failed:', updateError.message);
      } else {
        console.log('   ✅ Report updated successfully');
        console.log('   📋 New status:', updateData.status);
      }

      // Test 4: Query reports
      console.log('\n4. Testing report queries...');
      const { data: queryData, error: queryError } = await supabase
        .from('spot_reports')
        .select('*')
        .eq('spot_id', testReport.spot_id);

      if (queryError) {
        console.log('   ❌ Query failed:', queryError.message);
      } else {
        console.log('   ✅ Query successful');
        console.log('   📊 Found', queryData.length, 'reports');
      }

      // Test 5: Delete the test report
      console.log('\n5. Testing report deletion...');
      const { error: deleteError } = await supabase
        .from('spot_reports')
        .delete()
        .eq('id', data.id);

      if (deleteError) {
        console.log('   ❌ Delete failed:', deleteError.message);
      } else {
        console.log('   ✅ Report deleted successfully');
      }
    }
  } catch (error) {
    console.log('   ❌ Test failed:', error.message);
  }

  // Test 6: Test filtering and sorting
  console.log('\n6. Testing advanced queries...');
  try {
    const { data: allReports, error } = await supabase
      .from('spot_reports')
      .select(`
        *,
        created_at,
        status
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.log('   ❌ Advanced query failed:', error.message);
    } else {
      console.log('   ✅ Advanced query successful');
      console.log('   📊 Retrieved', allReports.length, 'recent reports');
      
      if (allReports.length > 0) {
        console.log('   📋 Sample report:', {
          id: allReports[0].id,
          status: allReports[0].status,
          created_at: allReports[0].created_at
        });
      }
    }
  } catch (error) {
    console.log('   ❌ Advanced query test failed:', error.message);
  }

  // Test 7: Test report status filtering
  console.log('\n7. Testing status filtering...');
  const statuses = ['pending', 'approved', 'rejected'];
  
  for (const status of statuses) {
    try {
      const { data, error } = await supabase
        .from('spot_reports')
        .select('id')
        .eq('status', status);

      if (error) {
        console.log(`   ❌ ${status} filter failed:`, error.message);
      } else {
        console.log(`   ✅ ${status} filter working (${data.length} reports)`);
      }
    } catch (error) {
      console.log(`   ❌ ${status} filter test failed:`, error.message);
    }
  }

  console.log('\n🎉 Spot Reports Table Test Complete!');
}

// Helper function to test database connectivity
async function testDatabaseConnection() {
  try {
    const { data, error } = await supabase.from('spot_reports').select('count').limit(1);
    return !error;
  } catch {
    return false;
  }
}

// Run tests
async function main() {
  console.log('🔍 Testing database connection...');
  const dbConnected = await testDatabaseConnection();
  
  if (!dbConnected) {
    console.log('❌ Cannot connect to database');
    console.log('💡 Check your Supabase credentials and network connection');
    process.exit(1);
  }

  console.log('✅ Database connection successful\n');
  await testSpotReportsTable();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testSpotReportsTable };
