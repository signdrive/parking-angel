const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? 'Set' : 'Missing')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testBlogFunctionality() {
  console.log('🔍 Testing Blog Database Functionality...\n')
  
  // Test 1: Check if blog_posts table exists and has data
  console.log('1. Testing blog_posts table...')
  try {
    const { data: posts, error: postsError } = await supabase
      .from('blog_posts')
      .select('*')
      .limit(5)
    
    if (postsError) {
      console.log('❌ blog_posts error:', postsError.message)
    } else {
      console.log(`✅ blog_posts table exists with ${posts?.length || 0} posts`)
      if (posts && posts.length > 0) {
        console.log('   Sample post:', {
          id: posts[0].id,
          title: posts[0].title,
          slug: posts[0].slug,
          published: posts[0].published
        })
      }
    }
  } catch (error) {
    console.log('❌ blog_posts table error:', error)
  }
  
  // Test 2: Check if blog_categories table exists
  console.log('\n2. Testing blog_categories table...')
  try {
    const { data: categories, error: categoriesError } = await supabase
      .from('blog_categories')
      .select('*')
      .limit(5)
    
    if (categoriesError) {
      console.log('❌ blog_categories error:', categoriesError.message)
      console.log('   This table likely doesn\'t exist')
    } else {
      console.log(`✅ blog_categories table exists with ${categories?.length || 0} categories`)
      if (categories && categories.length > 0) {
        console.log('   Sample categories:', categories.map(c => c.name))
      }
    }
  } catch (error) {
    console.log('❌ blog_categories table error:', error)
  }
  
  // Test 3: Check if blog_tags table exists
  console.log('\n3. Testing blog_tags table...')
  try {
    const { data: tags, error: tagsError } = await supabase
      .from('blog_tags')
      .select('*')
      .limit(5)
    
    if (tagsError) {
      console.log('❌ blog_tags error:', tagsError.message)
      console.log('   This table likely doesn\'t exist')
    } else {
      console.log(`✅ blog_tags table exists with ${tags?.length || 0} tags`)
      if (tags && tags.length > 0) {
        console.log('   Sample tags:', tags.map(t => t.name))
      }
    }
  } catch (error) {
    console.log('❌ blog_tags table error:', error)
  }
  
  // Test 4: Check profiles table for author information
  console.log('\n4. Testing profiles table...')
  try {
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, display_name, email')
      .limit(5)
    
    if (profilesError) {
      console.log('❌ profiles error:', profilesError.message)
    } else {
      console.log(`✅ profiles table exists with ${profiles?.length || 0} profiles`)
    }
  } catch (error) {
    console.log('❌ profiles table error:', error)
  }
  
  // Test 5: Check table structure
  console.log('\n5. Checking blog_posts table structure...')
  try {
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('*')
      .limit(1)
    
    if (!error && posts && posts.length > 0) {
      console.log('✅ blog_posts columns:', Object.keys(posts[0]))
    }
  } catch (error) {
    console.log('❌ Could not check table structure:', error)
  }
  
  console.log('\n🔍 Test completed!')
}

testBlogFunctionality().catch(console.error)
