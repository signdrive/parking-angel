const { serverBlogService } = require('./lib/blog/server-blog-service');

async function testCanonicalUrls() {
  console.log('Testing canonical URL fixes...\n');
  
  try {
    // Test getting a blog post
    const posts = await serverBlogService.getAllPosts();
    console.log(`Found ${posts.length} blog posts total`);
    
    if (posts.length > 0) {
      const firstPost = posts[0];
      console.log(`\nFirst post: "${firstPost.title}" with slug: ${firstPost.slug}`);
      console.log(`Expected canonical URL: https://parkalgo.com/blog/${firstPost.slug}\n`);
    }
    
    // Test getting categories
    const categories = await serverBlogService.getAllCategories();
    console.log(`Found ${categories.length} categories total`);
    
    if (categories.length > 0) {
      const firstCategory = categories[0];
      console.log(`\nFirst category: "${firstCategory.name}" with slug: ${firstCategory.slug}`);
      console.log(`Expected canonical URL: https://parkalgo.com/blog/category/${firstCategory.slug}\n`);
    }
    
    // Test getting tags  
    const tags = await serverBlogService.getAllTags();
    console.log(`Found ${tags.length} tags total`);
    
    if (tags.length > 0) {
      const firstTag = tags[0];
      console.log(`\nFirst tag: "${firstTag.name}" with slug: ${firstTag.slug}`);
      console.log(`Expected canonical URL: https://parkalgo.com/blog/tag/${firstTag.slug}\n`);
    }
    
  } catch (error) {
    console.error('Error testing canonical URLs:', error.message);
  }
}

testCanonicalUrls();
