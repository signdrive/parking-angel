require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Not set');
console.log('Service Key:', supabaseKey ? 'Set' : 'Not set');

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testBlogPostCreation() {
  console.log('Testing blog post creation...');
  
  // Try to create a minimal blog post
  const testData = {
    title: 'Test Post',
    content: 'Test content',
    slug: 'test-post-' + Date.now(),
    category_id: '1', // Assuming category 1 exists
    author_id: 'test-author',
    published: false,
    featured: false,
    tags: ['test']
  };
  
  console.log('Test data:', testData);
  
  const { data, error } = await supabase
    .from('blog_posts')
    .insert([testData])
    .select()
    .single();
    
  if (error) {
    console.error('❌ Error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
  } else {
    console.log('✅ Success:', data);
    
    // Clean up
    await supabase.from('blog_posts').delete().eq('id', data.id);
    console.log('🧹 Test record cleaned up');
  }
}

testBlogPostCreation().catch(console.error);
