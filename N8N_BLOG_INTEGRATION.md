# n8n Blog Integration Guide

This guide shows you how to integrate n8n with your ParkAlgo blog system to automate content creation.

## 🚀 Quick Setup

### 1. Environment Variables

Add this to your `.env.local` file:
```env
N8N_BLOG_API_KEY=your-secure-api-key-here
```

### 2. API Endpoints

Your blog system now has these n8n-ready endpoints:

#### **Posts API**
- **POST** `/api/blog/posts` - Create new blog post
- **GET** `/api/blog/posts` - Retrieve blog posts

#### **Categories API**  
- **POST** `/api/blog/categories` - Create new category
- **GET** `/api/blog/categories` - Retrieve categories

## 📝 n8n Workflow Examples

### Example 1: RSS Feed to Blog Posts

```json
{
  "name": "RSS to Blog Automation",
  "nodes": [
    {
      "name": "RSS Feed Reader",
      "type": "n8n-nodes-base.rssFeedRead",
      "parameters": {
        "url": "https://example.com/rss.xml"
      }
    },
    {
      "name": "Create Blog Post",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "https://your-domain.com/api/blog/posts",
        "headers": {
          "x-api-key": "your-secure-api-key-here",
          "Content-Type": "application/json"
        },
        "body": {
          "title": "={{$node['RSS Feed Reader'].json['title']}}",
          "content": "={{$node['RSS Feed Reader'].json['contentSnippet']}}",
          "excerpt": "={{$node['RSS Feed Reader'].json['title']}}",
          "category_slug": "news",
          "tags": ["automated", "rss"],
          "published": true,
          "featured_image_url": "={{$node['RSS Feed Reader'].json['enclosure']['url']}}"
        }
      }
    }
  ]
}
```

### Example 2: Create Category First, Then Posts

```json
{
  "name": "Category + Post Creation",
  "nodes": [
    {
      "name": "Create Category",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "https://your-domain.com/api/blog/categories",
        "headers": {
          "x-api-key": "your-secure-api-key-here",
          "Content-Type": "application/json"
        },
        "body": {
          "name": "AI & Technology",
          "description": "Posts about AI and technology trends",
          "color": "#10B981"
        }
      }
    },
    {
      "name": "Create Blog Post",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "https://your-domain.com/api/blog/posts",
        "headers": {
          "x-api-key": "your-secure-api-key-here",
          "Content-Type": "application/json"
        },
        "body": {
          "title": "Latest AI Developments in Parking",
          "content": "<p>Your content here...</p>",
          "category_slug": "ai-technology",
          "tags": ["ai", "parking", "technology"],
          "published": true
        }
      }
    }
  ]
}
```

## 🔧 Request Examples

### Create a Blog Post

```bash
curl -X POST https://your-domain.com/api/blog/posts \
  -H "x-api-key: your-secure-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Smart Parking Revolution",
    "content": "<h2>Introduction</h2><p>The future of parking is here...</p>",
    "excerpt": "Discover how AI is transforming parking management",
    "category_slug": "technology",
    "tags": ["parking", "ai", "smart-city"],
    "featured": true,
    "published": true,
    "meta_title": "Smart Parking Revolution | ParkAlgo",
    "meta_description": "Learn about the latest innovations in AI-powered parking solutions",
    "featured_image_url": "https://example.com/image.jpg"
  }'
```

### Get All Categories

```bash
curl -X GET https://your-domain.com/api/blog/categories \
  -H "x-api-key: your-secure-api-key-here"
```

### Get Recent Blog Posts

```bash
curl -X GET "https://your-domain.com/api/blog/posts?limit=5&published=true" \
  -H "x-api-key: your-secure-api-key-here"
```

## 📊 API Response Examples

### Successful Post Creation
```json
{
  "success": true,
  "message": "Blog post created successfully",
  "post": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Smart Parking Revolution",
    "slug": "smart-parking-revolution",
    "published": true,
    "url": "https://your-domain.com/blog/smart-parking-revolution"
  }
}
```

### Error Response
```json
{
  "error": "Post with slug 'smart-parking-revolution' already exists"
}
```

## 🔄 Advanced n8n Workflows

### 1. **Content Curation Workflow**
- Monitor multiple RSS feeds
- Filter content by keywords
- Auto-categorize posts
- Schedule publishing

### 2. **Social Media to Blog**
- Monitor Twitter hashtags
- Convert tweets to blog posts
- Add social media context
- Auto-publish with attribution

### 3. **Email Newsletter to Blog**
- Process incoming newsletters
- Extract key articles
- Reformat for blog
- Schedule for publication

### 4. **Multi-Source Content Aggregation**
- Combine multiple content sources
- De-duplicate similar posts
- Enhance with additional research
- Auto-tag and categorize

## 🛡️ Security & Best Practices

### API Key Security
- Store API key in n8n credentials
- Use environment variables in production
- Rotate keys regularly
- Monitor API usage

### Content Validation
- Always validate required fields
- Check for duplicate slugs
- Sanitize HTML content
- Verify image URLs

### Error Handling
- Implement retry logic for failed requests
- Log errors for debugging
- Set up alerts for critical failures
- Handle rate limiting gracefully

## 🚀 Production Deployment

### 1. Set Environment Variables
```bash
# In your production environment
export N8N_BLOG_API_KEY="your-production-api-key"
export NEXT_PUBLIC_SITE_URL="https://your-domain.com"
```

### 2. n8n Webhook Configuration
```json
{
  "webhookUrl": "https://your-domain.com/api/blog/posts",
  "httpMethod": "POST",
  "headers": {
    "x-api-key": "{{$env.N8N_BLOG_API_KEY}}",
    "x-n8n-webhook-id": "{{$workflow.id}}"
  }
}
```

### 3. Monitoring & Logging
- Set up error alerts in n8n
- Monitor API response times
- Track content creation metrics
- Log all automated posts

## 📱 Testing Your Integration

### 1. Test API Endpoints
Visit: `http://localhost:3000/api/blog/posts` with proper headers

### 2. Validate n8n Workflow
- Test with sample data
- Check error handling
- Verify content formatting
- Confirm publishing status

### 3. Monitor Results
- Check admin dashboard: `/admin/blog`
- Verify public blog: `/blog`
- Review automated posts
- Validate SEO metadata

## 🎯 Use Cases

### Content Marketing Automation
- Auto-publish press releases
- Schedule promotional content
- Distribute thought leadership
- Sync with marketing calendar

### News Aggregation
- Curate industry news
- Monitor competitor content
- Track trending topics
- Auto-tag relevant content

### Social Media Integration
- Convert social posts to blog articles
- Aggregate user-generated content
- Cross-post to multiple platforms
- Schedule social media announcements

## 🔗 Additional Resources

- **Blog Admin**: `/admin/blog`
- **API Documentation**: `/api/blog/setup`
- **Public Blog**: `/blog`
- **Quick Access**: `/blog-admin`

---

**Ready to automate your blog content with n8n!** 🚀

Set your API key, configure your workflows, and watch your blog grow automatically!
