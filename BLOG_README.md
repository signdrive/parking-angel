# ParkAlgo Blog Management System

A comprehensive blog management system built with Next.js 15, Supabase, and TypeScript.

## 🚀 Features

### Content Management
- ✅ **Rich Blog Editor** - Create and edit posts with markdown support
- ✅ **Category Management** - Organize content into categories
- ✅ **Tag System** - Flexible tagging with color coding
- ✅ **Draft/Publish Workflow** - Control content visibility
- ✅ **Featured Posts** - Highlight important content
- ✅ **SEO Optimization** - Meta titles, descriptions, and structured data

### Admin Interface
- ✅ **Dashboard** - Overview of all posts and content
- ✅ **WYSIWYG Editor** - Easy content creation
- ✅ **Media Support** - Featured image URLs
- ✅ **Bulk Actions** - Publish/unpublish, delete multiple posts
- ✅ **Real-time Preview** - See changes as you type

### Public Blog
- ✅ **Responsive Design** - Mobile-friendly interface
- ✅ **Category Pages** - Browse posts by category
- ✅ **Tag Pages** - Filter content by tags
- ✅ **Related Posts** - Intelligent content suggestions
- ✅ **Search Optimized** - Proper SEO and structured data

## 📁 File Structure

```
app/
├── admin/blog/           # Admin interface
│   ├── page.tsx         # Blog dashboard
│   ├── new/page.tsx     # Create new post
│   ├── edit/[id]/       # Edit existing post
│   ├── manage/page.tsx  # Categories & tags
│   └── layout.tsx       # Admin layout
├── blog/                # Public blog
│   ├── page.tsx         # Blog homepage
│   ├── [slug]/page.tsx  # Individual post pages
│   ├── category/[slug]/ # Category pages
│   └── tag/[slug]/      # Tag pages
└── api/blog/setup/      # Setup API

lib/blog/
├── blog-service.ts      # Main service layer
└── setup-tables.ts     # Database setup utilities

database/
├── blog_schema.sql      # Original schema
└── blog_schema_updated.sql # Updated schema with all fields
```

## 🛠 Setup Instructions

### 1. Database Setup

The blog system requires these Supabase tables:
- `blog_categories` - Content categories
- `blog_tags` - Content tags  
- `blog_posts` - Blog posts
- `blog_comments` - Comments (future feature)

Run the SQL schema in your Supabase dashboard:
```sql
-- See database/blog_schema_updated.sql for complete schema
```

### 2. Environment Variables

Ensure your `.env.local` has:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Authentication

The admin interface requires user authentication. Users must be logged in to:
- Create, edit, or delete posts
- Manage categories and tags
- Access the admin dashboard

## 🎯 Usage

### Creating Your First Post

1. Navigate to `/admin/blog`
2. Click "New Post"
3. Fill in the title (slug auto-generates)
4. Select a category
5. Add tags
6. Write your content
7. Set SEO metadata
8. Save as draft or publish immediately

### Managing Categories

1. Go to `/admin/blog/manage`
2. Add new categories with:
   - Name and slug
   - Description
   - Color coding
3. Edit or delete existing categories

### Managing Tags

1. In the manage section, create tags with:
   - Name and slug
   - Color for visual organization
2. Tags are automatically suggested when creating posts

## 🔧 Technical Details

### Service Layer

**BlogService** (Client-side)
- CRUD operations for posts, categories, tags
- Real-time updates
- Optimistic UI updates

**ServerBlogService** (Server-side)
- SEO-optimized data fetching
- Server-side rendering support
- Performance optimized queries

### Database Design

- **Normalized structure** with foreign keys
- **Row Level Security** for data protection
- **Indexes** for performance
- **Triggers** for automatic timestamps

### SEO Features

- Dynamic meta tags
- Open Graph support
- Twitter Card integration
- Structured data (JSON-LD)
- Canonical URLs
- Automatic sitemap generation

## 🔒 Security

- **RLS Policies** - Row level security enabled
- **Authentication Required** - Admin functions require login
- **Input Validation** - All inputs validated and sanitized
- **XSS Protection** - Content properly escaped

## 📱 Responsive Design

- Mobile-first approach
- Touch-friendly admin interface
- Progressive enhancement
- Fast loading on all devices

## 🚀 Performance

- **Server-side rendering** for public pages
- **Client-side caching** for admin interface
- **Optimized queries** with proper joins
- **Lazy loading** for images and content

## 🔮 Future Enhancements

- [ ] Comment system
- [ ] Rich text editor (WYSIWYG)
- [ ] Image upload and management
- [ ] Advanced search functionality
- [ ] Email notifications
- [ ] Social media integration
- [ ] Analytics dashboard
- [ ] Content scheduling

## 🐛 Troubleshooting

### Common Issues

1. **Tables don't exist**: Run the SQL schema in Supabase
2. **Permission denied**: Check RLS policies and authentication
3. **Images not loading**: Verify featured_image_url format
4. **Slugs conflict**: Ensure unique slugs for posts and categories

### Debug Mode

Check the browser console and network tab for detailed error messages. The service layer logs errors for debugging.

## 📞 Support

For issues or questions:
1. Check the browser console for errors
2. Verify database connection via `/api/blog/setup`
3. Ensure authentication is working
4. Check Supabase dashboard for data issues

---

**Built with ❤️ for ParkAlgo**
