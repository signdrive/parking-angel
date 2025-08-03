import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔧 Environment check:')
console.log('  Supabase URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
console.log('  Service Key:', supabaseKey ? '✅ Set' : '❌ Missing')

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  console.log('Please ensure .env file exists with:')
  console.log('  NEXT_PUBLIC_SUPABASE_URL=your_url')
  console.log('  SUPABASE_SERVICE_ROLE_KEY=your_key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkAndFixCategories() {
  console.log('🔍 Checking blog categories and posts...')
  
  try {
    // Check categories
    const { data: categories, error: catError } = await supabase
      .from('blog_categories')
      .select('*')
    
    if (catError) {
      console.error('❌ Error fetching categories:', catError)
      return
    }
    
    console.log('📁 Categories found:', categories?.length || 0)
    categories?.forEach(cat => {
      console.log(`  - ${cat.name} (${cat.slug}) [ID: ${cat.id}]`)
    })
    
    // Check posts with proper category joins
    const { data: posts, error: postError } = await supabase
      .from('blog_posts')
      .select(`
        id,
        title,
        slug,
        category_id,
        blog_categories!inner(
          name,
          slug
        )
      `)
      .eq('published', true)
    
    if (postError) {
      console.error('❌ Error fetching posts with categories:', postError)
      return
    }
    
    console.log('\n📄 Posts with categories:')
    posts?.forEach(post => {
      console.log(`  - "${post.title}"`)
      console.log(`    Category ID: ${post.category_id}`)
      console.log(`    Category: ${post.blog_categories?.name || 'NULL'} (${post.blog_categories?.slug || 'NULL'})`)
    })
    
    // If we have categories but posts don't have proper category_id, let's fix it
    if (categories && categories.length > 0 && posts) {
      const defaultCategory = categories[0] // Use first category as default
      
      const postsToUpdate = posts.filter(post => !post.blog_categories?.name)
      
      if (postsToUpdate.length > 0) {
        console.log(`\n🔧 Fixing ${postsToUpdate.length} posts with missing categories...`)
        
        for (const post of postsToUpdate) {
          const { error: updateError } = await supabase
            .from('blog_posts')  
            .update({ category_id: defaultCategory.id })
            .eq('id', post.id)
            
          if (updateError) {
            console.error(`❌ Error updating post ${post.id}:`, updateError)
          } else {
            console.log(`✅ Updated post "${post.title}" with category "${defaultCategory.name}"`)
          }
        }
      }
    }
    
    console.log('\n✅ Category check complete!')
    
  } catch (error) {
    console.error('❌ Error in checkAndFixCategories:', error)
  }
}

checkAndFixCategories()
