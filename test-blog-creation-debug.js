require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCategories() {
  console.log('🔍 Checking blog categories...');
  
  const { data, error } = await supabase
    .from('blog_categories')
    .select('*')
    .limit(5);
    
  if (error) {
    console.error('❌ Categories error:', error);
  } else {
    console.log('✅ Categories found:', data.length);
    console.log('First category:', data[0]);
  }
  
  return data?.[0]?.id;
}

async function testBlogPostCreation() {
  const categoryId = await checkCategories();
  
  if (!categoryId) {
    console.error('❌ No categories found');
    return;
  }
  
  console.log('🔍 Testing blog post creation...');
  
  const testData = {
    title: 'Test Post ' + Date.now(),
    content: 'This is test content for the blog post.',
    slug: 'test-post-' + Date.now(),
    category_id: categoryId,
    author_id: 'test-author-123',
    published: false,
    featured: false,
    tags: ['test', 'debugging']
  };
  
  console.log('📝 Test data:', testData);
  
  const { data, error } = await supabase
    .from('blog_posts')
    .insert([testData])
    .select()
    .single();
    
  if (error) {
    console.error('❌ Error creating post:', error);
    console.error('🔍 Error details:', JSON.stringify(error, null, 2));
  } else {
    console.log('✅ Post created successfully:', data);
    
    // Clean up
    await supabase.from('blog_posts').delete().eq('id', data.id);
    console.log('🧹 Test record cleaned up');
  }
}

testBlogPostCreation().catch(console.error);
