const { createClient } = require('@supabase/supabase-js')

// Test with hardcoded values first
console.log('Testing Supabase connection...')

async function quickTest() {
  // Load env vars manually
  const fs = require('fs')
  const path = require('path')
  
  try {
    const envPath = path.join(__dirname, '.env.local')
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8')
      console.log('Found .env.local file')
      
      // Parse env manually
      const lines = envContent.split('\n')
      const env = {}
      for (const line of lines) {
        if (line.includes('=') && !line.startsWith('#')) {
          const [key, ...valueParts] = line.split('=')
          env[key.trim()] = valueParts.join('=').trim()
        }
      }
      
      const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY
      
      if (!supabaseUrl || !supabaseKey) {
        console.log('❌ Missing Supabase credentials in .env.local')
        console.log('URL exists:', !!supabaseUrl)
        console.log('Key exists:', !!supabaseKey)
        return
      }
      
      console.log('✅ Found Supabase credentials')
      
      const supabase = createClient(supabaseUrl, supabaseKey)
      
      // Test blog_posts table
      console.log('\nTesting blog_posts...')
      const { data: posts, error: postsError } = await supabase
        .from('blog_posts')
        .select('id, title, slug, published')
        .limit(3)
      
      if (postsError) {
        console.log('❌ blog_posts error:', postsError.message)
      } else {
        console.log('✅ blog_posts works, found', posts?.length || 0, 'posts')
        if (posts && posts.length > 0) {
          console.log('   Sample:', posts[0])
        }
      }
      
      // Test blog_categories table
      console.log('\nTesting blog_categories...')
      const { data: categories, error: catError } = await supabase
        .from('blog_categories')
        .select('*')
        .limit(3)
      
      if (catError) {
        console.log('❌ blog_categories error:', catError.message)
        console.log('   (This confirms the table doesn\'t exist)')
      } else {
        console.log('✅ blog_categories works, found', categories?.length || 0, 'categories')
      }
      
      // Test our service methods
      console.log('\nTesting ServerBlogService methods...')
      
    } else {
      console.log('❌ No .env.local file found')
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

quickTest().catch(console.error)
