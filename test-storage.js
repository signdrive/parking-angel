import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: '.env.local' })

async function testStorage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  console.log('🔍 Testing Supabase Storage...')

  try {
    // List all buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError)
      return
    }
    
    console.log('📦 Available buckets:')
    buckets.forEach(bucket => {
      console.log(`  - ${bucket.name} (${bucket.public ? 'public' : 'private'})`)
    })

    // Check if blog-assets bucket exists
    const blogAssetsBucket = buckets.find(b => b.name === 'blog-assets')
    
    if (!blogAssetsBucket) {
      console.log('⚠️  blog-assets bucket does not exist. Creating it...')
      
      const { data: newBucket, error: createError } = await supabase.storage.createBucket('blog-assets', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB
      })
      
      if (createError) {
        console.error('❌ Error creating blog-assets bucket:', createError)
      } else {
        console.log('✅ Created blog-assets bucket successfully')
      }
    } else {
      console.log('✅ blog-assets bucket exists')
    }

    // Test upload
    console.log('🧪 Testing upload...')
    const testData = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]) // PNG header
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('blog-assets')
      .upload('test/test.png', testData, {
        contentType: 'image/png'
      })
    
    if (uploadError) {
      console.error('❌ Upload test failed:', uploadError)
    } else {
      console.log('✅ Upload test successful:', uploadData)
      
      // Clean up test file
      await supabase.storage.from('blog-assets').remove(['test/test.png'])
      console.log('🧹 Cleaned up test file')
    }

  } catch (error) {
    console.error('❌ Storage test failed:', error)
  }
}

testStorage()
