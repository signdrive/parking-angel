require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

async function checkData() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Check categories
  console.log('📁 Checking blog categories...');
  const { data: categories, error: catError } = await supabase
    .from('blog_categories')
    .select('*')
    .limit(3);
    
  if (catError) {
    console.error('❌ Categories error:', catError);
  } else {
    console.log(`✅ Found ${categories.length} categories:`);
    categories.forEach(cat => {
      console.log(`  - ID: ${cat.id} | Name: ${cat.name} | Slug: ${cat.slug}`);
    });
  }

  // Check auth users to get a valid UUID
  console.log('\n👤 Checking auth users...');
  const { data: users, error: userError } = await supabase.auth.admin.listUsers();
  
  if (userError) {
    console.error('❌ Users error:', userError);
  } else {
    console.log(`✅ Found ${users.users.length} users:`);
    users.users.slice(0, 2).forEach(user => {
      console.log(`  - ID: ${user.id} | Email: ${user.email}`);
    });
  }
}

checkData().catch(console.error);
