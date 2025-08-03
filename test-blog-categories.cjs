const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  console.log('=== Blog Categories Test ===');
  
  try {
    // Check existing categories
    const { data: categories, error } = await supabase
      .from('blog_categories')
      .select('*')
      .order('name');
      
    if (error) {
      console.error('❌ Error fetching categories:', error);
      return;
    }
    
    console.log('✅ Found', categories?.length || 0, 'categories:');
    categories?.forEach(cat => console.log('   -', cat.name, '(' + cat.slug + ')', cat.color));
    
    // If no categories, add some default ones
    if (!categories || categories.length === 0) {
      console.log('\n📝 Adding default categories...');
      
      const defaultCategories = [
        { name: 'Technology', slug: 'technology', description: 'Posts about parking technology and innovations', color: '#3B82F6' },
        { name: 'News', slug: 'news', description: 'Latest news and updates', color: '#10B981' },
        { name: 'Tips', slug: 'tips', description: 'Parking tips and guides', color: '#F59E0B' },
        { name: 'Industry', slug: 'industry', description: 'Parking industry insights', color: '#8B5CF6' }
      ];
      
      const { data: insertedCategories, error: insertError } = await supabase
        .from('blog_categories')
        .insert(defaultCategories)
        .select();
        
      if (insertError) {
        console.error('❌ Error inserting categories:', insertError);
      } else {
        console.log('✅ Added', insertedCategories?.length || 0, 'categories');
        insertedCategories?.forEach(cat => console.log('   +', cat.name));
      }
    }
    
    console.log('\n=== Test Complete ===');
  } catch (ex) {
    console.error('❌ Exception:', ex);
  }
})();
