import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

async function testSubscriptionAPI() {
  console.log('🔍 Testing subscription status API...\n');
  
  // Create a Supabase client and get a user session
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  
  // Use the email from the subscription we found
  const email = 'imchichi.depuydt@gmail.com';
  console.log('📧 Testing with email:', email);
  
  // We need to sign in to get a valid session token
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: email,
    password: 'test123' // You'll need to use the actual password
  });
  
  if (signInError) {
    console.log('❌ Sign in failed (expected if password is wrong):', signInError.message);
    console.log('Let me check user auth with service role instead...\n');
    
    // Use service role to check user
    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    const { data: users, error: usersError } = await serviceSupabase.auth.admin.listUsers();
    if (usersError) {
      console.log('❌ Error listing users:', usersError.message);
      return;
    }
    
    const user = users.users.find(u => u.email === email);
    if (user) {
      console.log('✅ Found user:', { id: user.id, email: user.email });
      
      // Now test the subscription API directly
      console.log('\n🧪 Testing subscription status API...');
      
      // Test localhost:3000/api/subscription/status
      try {
        const response = await fetch('http://localhost:3000/api/subscription/status', {
          headers: {
            'Authorization': `Bearer ${user.id}` // This won't work but let's see the error
          }
        });
        
        console.log('API Response status:', response.status);
        const text = await response.text();
        console.log('API Response:', text);
      } catch (error) {
        console.log('❌ Error calling API:', error.message);
      }
    }
  } else {
    console.log('✅ Sign in successful');
    const session = signInData.session;
    
    if (session?.access_token) {
      console.log('✅ Got access token');
      
      // Now test the API
      try {
        const response = await fetch('http://localhost:3000/api/subscription/status', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('API Response status:', response.status);
        const data = await response.json();
        console.log('API Response data:', data);
      } catch (error) {
        console.log('❌ Error calling API:', error.message);
      }
    }
  }
}

testSubscriptionAPI();
