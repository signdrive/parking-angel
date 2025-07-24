# ParkAlgo n8n Blog Automation Setup

This guide helps you set up the modified n8n workflow to automatically post content to your ParkAlgo blog at parkalgo.com.

## 🚀 Quick Setup Checklist

### 1. Environment Variables
Set these environment variables in your n8n instance:

```bash
N8N_BLOG_API_KEY=your-production-api-key-here
```

### 2. Import Workflow
1. Open your n8n instance
2. Go to Workflows → Import from File
3. Upload the `workflow.json` file
4. Configure the credentials (OpenAI API and SMTP)

### 3. Configure Credentials

#### OpenAI API Credential
- **Name**: "OpenAi account 2"
- **API Key**: Your OpenAI API key
- Required for content generation and image creation

#### SMTP Credential  
- **Name**: "SMTP account"
- **Host**: Your email provider's SMTP host
- **Port**: Usually 587 or 465
- **Username**: Your email address
- **Password**: Your email password or app password
- Required for success/error notifications

### 4. Production URLs
The workflow is configured to post to:
- **Production**: `https://parkalgo.com/api/blog/posts`
- **Staging**: `http://localhost:3000/api/blog/posts` (for testing)

## 📋 Workflow Overview

### Nodes and Flow
1. **Schedule Trigger** → Runs daily at 9 AM
2. **Generate Topic Seed** → Creates parking-related topic ideas
3. **Generate Topic Options** → Uses AI to create compelling titles
4. **Select Best Topic** → Chooses the best title
5. **Generate Blog Content** → Creates full blog post with AI
6. **Parse Blog Content** → Extracts and formats content
7. **SEO Optimization** → Generates SEO metadata
8. **Parse SEO Data** → Combines content with SEO data
9. **Content Validation** → Validates content quality
10. **Generate Image Prompt** → Creates AI image prompts
11. **Generate Image** → Creates featured images with DALL-E
12. **Save Image Data** → Processes and saves image
13. **Merge Content and Image** → Combines all data
14. **Format Email Content** → Prepares data for API
15. **Post to ParkAlgo Blog** → Publishes to your blog
16. **Success Notification** → Sends confirmation email

### Error Handling
- **Error Notification** → Sends error alerts if generation fails
- **Content Validation** → Ensures quality before publishing

## 🎯 Content Categories

The workflow generates content about:
- Smart Parking Solutions
- AI Parking Technology  
- Parking Management
- Urban Mobility
- Parking Optimization
- Smart City Technology

## 📝 API Request Format

The workflow sends this data to your blog API:

```json
{
  "title": "AI-Generated Blog Title",
  "content": "<h2>Introduction</h2><p>Blog content...</p>",
  "excerpt": "Auto-generated excerpt...",
  "category_slug": "automated-content",
  "tags": ["ai-generated", "automated", "n8n", "smart-parking"],
  "published": true,
  "featured": false,
  "meta_title": "SEO optimized title",
  "meta_description": "SEO description...",
  "featured_image_url": "data:image/png;base64,..."
}
```

## 🔧 Customization Options

### Change Publishing Schedule
Edit the **Schedule Trigger** node:
- **Current**: Daily at 9 AM
- **Custom**: Set your preferred time/frequency

### Modify Content Topics
Edit the **Generate Topic Seed** node:
- Update `prefixes`, `categories`, and `formats` arrays
- Add your specific parking industry focuses

### Adjust Content Categories
Edit the **Post to ParkAlgo Blog** node:
- Change `category_slug` from "automated-content"
- Modify tags array to match your categories

### Configure Publishing Status
In **Post to ParkAlgo Blog** node:
- Set `"published": false` to save as drafts
- Set `"featured": true` to mark as featured posts

## 🔐 Security Setup

### API Key Management
1. Generate a secure API key for production
2. Store it as an environment variable in n8n
3. Never hardcode the key in the workflow
4. Rotate keys regularly for security

### Webhook Security
The workflow includes:
- API key authentication headers
- n8n webhook ID for tracking
- Error handling for failed requests

## 📊 Monitoring & Alerts

### Success Notifications
Sent to configured email when posts are published:
- Post title and URL
- Publishing status
- Direct link to view the post
- Admin dashboard link

### Error Notifications  
Sent when content generation fails:
- Error details and debugging info
- Content validation failures
- API connection issues

## 🚀 Going Live

### 1. Test First
- Run the workflow manually in n8n
- Check that posts appear in your blog admin
- Verify email notifications work

### 2. Enable Scheduling
- Activate the Schedule Trigger node
- Monitor the first few automated runs
- Adjust timing/frequency as needed

### 3. Monitor Performance
- Check email notifications regularly
- Review generated content quality
- Monitor API usage and costs

## 🛠 Troubleshooting

### Common Issues

**API Key Errors**
- Verify `N8N_BLOG_API_KEY` environment variable
- Check that the key matches your production setup

**Content Quality Issues**
- Adjust OpenAI prompts in relevant nodes
- Modify content validation rules
- Update fallback content templates

**Image Generation Failures**
- Check OpenAI API credits and limits
- Verify DALL-E 3 availability
- Adjust image prompts for better results

**Publishing Failures**
- Verify parkalgo.com API endpoint is accessible
- Check that required blog categories exist
- Ensure database connectivity

### Debug Mode
Enable debug mode in n8n to see:
- Detailed node execution logs
- API request/response data
- Content generation steps
- Error messages and stack traces

## 📈 Optimization Tips

### Content Quality
- Regularly review and update AI prompts
- Add more specific parking industry terminology
- Include current industry trends and keywords

### SEO Performance
- Monitor which topics perform best
- Adjust meta descriptions and titles
- Use analytics to improve content strategy

### Operational Efficiency
- Set up monitoring dashboards
- Create alerts for API failures
- Regular backup of workflow configuration

---

**Ready to automate your ParkAlgo blog content!** 🚀

This workflow will generate high-quality, parking industry-focused content automatically and publish it directly to your blog at parkalgo.com.

For support, check the error notifications and n8n execution logs for detailed debugging information.
