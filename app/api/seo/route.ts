import { NextRequest, NextResponse } from 'next/server'
import { serverBlogService } from '@/lib/blog/server-blog-service'

// Complete SEO-optimized HTML for crawlers based on Strapi's Next.js SEO best practices
const SEO_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Primary Meta Tags -->
    <title>AI Parking Optimization | Smart Algorithms | Parkalgo</title>
    <meta name="description" content="Transform parking efficiency with AI-powered algorithms. Smart parking management software that reduces congestion and maximizes revenue through intelligent automation for businesses and cities.">
    <meta name="keywords" content="AI parking optimization, smart parking algorithms, parking management software, automated parking solutions, intelligent parking systems, dynamic parking pricing, smart city parking">
    <meta name="robots" content="index, follow">
    <meta name="author" content="Parkalgo">
    <link rel="canonical" href="https://parkalgo.com/">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://parkalgo.com/">
    <meta property="og:title" content="AI Parking Optimization Software | Smart Algorithms | Parkalgo">
    <meta property="og:description" content="Transform parking efficiency with AI-powered algorithms. Reduce congestion and maximize revenue through automated parking solutions.">
    <meta property="og:image" content="https://parkalgo.com/og-image.jpg">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="https://parkalgo.com/">
    <meta property="twitter:title" content="AI Parking Optimization Software | Parkalgo">
    <meta property="twitter:description" content="Smart parking algorithms that reduce congestion and maximize revenue.">
    <meta property="twitter:image" content="https://parkalgo.com/og-image.jpg">

    <!-- JSON-LD Structured Data -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Parkalgo - AI Parking Optimization",
        "url": "https://parkalgo.com",
        "description": "AI-powered parking optimization platform that reduces congestion and maximizes revenue through intelligent algorithms.",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        }
    }
    </script>
    
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #333; max-width: 1200px; margin: 0 auto; padding: 20px; }
        h1 { color: #1e40af; font-size: 2.5rem; margin-bottom: 1rem; }
        h2 { color: #374151; font-size: 1.8rem; margin: 2rem 0 1rem 0; }
        h3 { color: #4b5563; font-size: 1.3rem; margin: 1.5rem 0 0.5rem 0; }
        .feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin: 2rem 0; }
        .feature-card { background: #f8fafc; padding: 1.5rem; border-radius: 8px; }
        .plan-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin: 2rem 0; }
        .plan-card { background: #ffffff; border: 2px solid #e5e7eb; padding: 1.5rem; border-radius: 8px; }
        ul { margin: 1rem 0; }
        li { margin: 0.5rem 0; }
        .cta-button { display: inline-block; background: #1d4ed8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 0.5rem 0.5rem 0.5rem 0; }
        .internal-links { margin: 2rem 0; background: #f3f4f6; padding: 1.5rem; border-radius: 8px; }
        .internal-links a { color: #1d4ed8; text-decoration: none; margin-right: 1rem; display: inline-block; margin-bottom: 0.5rem; }
    </style>
</head>
<body>
    <main>
        <h1>AI Parking Optimization Smart Algorithms</h1>
        <p>Transform parking efficiency with AI-powered algorithms. Smart parking management software that reduces congestion and maximizes revenue through intelligent automation. Our platform serves property managers, smart cities, and businesses looking to optimize their parking operations with advanced machine learning technology.</p>
        
        <nav>
            <a href="/auth/signup" class="cta-button">Start Finding Parking</a>
            <a href="/dashboard" class="cta-button">View Live Demo</a>
        </nav>
        
        <section>
            <h2>Intelligent Parking Management Features</h2>
            <div class="feature-grid">
                <div class="feature-card">
                    <h3>Advanced AI Analytics</h3>
                    <p>Machine learning algorithms analyze real-time parking data, traffic patterns, and user behavior to deliver 94% accurate parking availability predictions. Our AI system processes thousands of data points to predict parking availability, identify peak usage patterns, and improve overall operational efficiency through intelligent automation and predictive modeling.</p>
                </div>
                <div class="feature-card">
                    <h3>Dynamic Pricing Optimization</h3>
                    <p>Intelligent pricing strategies that automatically adjust rates based on demand, time of day, seasonal patterns, and local events. Maximize revenue while ensuring optimal parking availability for customers through data-driven pricing decisions and automated rate adjustments that respond to real-time market conditions.</p>
                </div>
                <div class="feature-card">
                    <h3>Real-Time Monitoring Dashboard</h3>
                    <p>Live tracking of parking spaces with instant updates, comprehensive occupancy analytics, and predictive availability forecasting. Monitor multiple locations from a single, intuitive interface with customizable alerts, detailed reporting capabilities, and actionable insights for operational optimization.</p>
                </div>
            </div>
        </section>

        <section>
            <h2>Transform Your Parking Operations</h2>
            <div class="feature-grid">
                <div>
                    <h3>For Property Managers & Businesses</h3>
                    <ul>
                        <li>Increase parking revenue by 30-50% through intelligent pricing algorithms and demand optimization</li>
                        <li>Reduce operational costs through automated management and monitoring systems</li>
                        <li>Improve tenant and customer satisfaction with guaranteed parking availability</li>
                        <li>Access comprehensive analytics dashboards with real-time reporting and insights</li>
                        <li>Integrate seamlessly with existing property management and point-of-sale systems</li>
                        <li>Implement contactless payment solutions and mobile app integration</li>
                        <li>Optimize space utilization through data-driven allocation strategies</li>
                    </ul>
                </div>
                <div>
                    <h3>For Smart Cities & Municipalities</h3>
                    <ul>
                        <li>Reduce urban traffic congestion by up to 70% through intelligent routing and availability prediction</li>
                        <li>Implement dynamic pricing strategies for optimal space allocation across city districts</li>
                        <li>Monitor environmental impact with emissions tracking and carbon footprint reduction metrics</li>
                        <li>Integrate with existing smart city infrastructure and traffic management systems</li>
                        <li>Generate comprehensive reports for urban planning and development initiatives</li>
                        <li>Improve citizen satisfaction through reduced parking search times and stress</li>
                        <li>Support sustainable transportation initiatives and electric vehicle charging infrastructure</li>
                    </ul>
                </div>
            </div>
        </section>

        <section>
            <h2>Choose Your Perfect Plan</h2>
            <p>Start free and upgrade as your parking management needs grow. All plans include customer support and regular feature updates.</p>
            
            <div class="plan-grid">
                <div class="plan-card">
                    <h3>Starter Plan - Free</h3>
                    <p>Perfect for small parking operations and individual users exploring AI-powered parking optimization.</p>
                    <ul>
                        <li>5 parking searches per day with basic recommendations</li>
                        <li>Basic parking availability map with real-time updates</li>
                        <li>Community-driven parking reports and user feedback</li>
                        <li>Email customer support with standard response times</li>
                        <li>Mobile app access for iOS and Android devices</li>
                        <li>Basic analytics dashboard with essential metrics</li>
                    </ul>
                    <a href="/auth/signup" class="cta-button">Get Started Free</a>
                </div>
                
                <div class="plan-card">
                    <h3>Navigator Plan - $8.99/month</h3>
                    <p>Ideal for daily commuters and frequent parkers with unlimited access to premium features and advanced capabilities.</p>
                    <ul>
                        <li>Unlimited parking searches and AI-powered recommendations</li>
                        <li>Ad-free experience across all platforms and devices</li>
                        <li>Intelligent route planning and turn-by-turn navigation</li>
                        <li>15-minute spot hold reservation service with guarantees</li>
                        <li>Electric vehicle charging station locator and availability tracking</li>
                        <li>Priority customer support via chat and phone</li>
                        <li>Advanced analytics and detailed usage insights</li>
                    </ul>
                    <a href="/plans" class="cta-button">Choose Navigator</a>
                </div>
                
                <div class="plan-card">
                    <h3>Pro Parker Plan - $19.99/month</h3>
                    <p>Comprehensive solution for power users who need advanced AI features and priority access to premium services.</p>
                    <ul>
                        <li>Everything included in Navigator Plan plus advanced features</li>
                        <li>Real-time predictive analytics and demand forecasting</li>
                        <li>AI-powered parking pattern analysis and personalized recommendations</li>
                        <li>Reserved parking spot guarantees with flexible scheduling</li>
                        <li>Integration with calendar applications and travel planning tools</li>
                        <li>Premium customer support with dedicated account management</li>
                        <li>Custom reporting capabilities and data export functionality</li>
                    </ul>
                    <a href="/plans" class="cta-button">Go Pro</a>
                </div>
                
                <div class="plan-card">
                    <h3>Fleet Manager Plan - $49.99/month</h3>
                    <p>Enterprise-grade solution designed for businesses managing multiple vehicles and parking locations across their operations.</p>
                    <ul>
                        <li>Everything included in Pro Parker Plan plus enterprise features</li>
                        <li>Multi-vehicle fleet management dashboard with real-time tracking</li>
                        <li>Bulk parking reservations and automated operations management</li>
                        <li>Custom API integrations and white-label solution options</li>
                        <li>Advanced reporting with business intelligence and analytics</li>
                        <li>Dedicated technical support and implementation assistance</li>
                        <li>Custom training programs and onboarding for teams</li>
                    </ul>
                    <a href="/contact" class="cta-button">Contact Sales</a>
                </div>
            </div>
        </section>

        <section>
            <h2>Advanced Technology & Innovation</h2>
            <div class="feature-grid">
                <div>
                    <h3>Machine Learning & Artificial Intelligence</h3>
                    <p>Our proprietary neural networks and machine learning models process millions of data points daily, continuously learning from traffic patterns, weather conditions, local events, and user behavior patterns. The system adapts and improves prediction accuracy over time, delivering increasingly precise parking availability forecasts and intelligent route optimizations that save time and reduce environmental impact.</p>
                </div>
                <div>
                    <h3>Real-Time Data Processing & Analytics</h3>
                    <p>Built on modern cloud infrastructure with edge computing capabilities, our platform processes parking data in real-time with sub-second response times and 99.9% uptime reliability. Integration with IoT sensors, mobile devices, GPS systems, and municipal parking infrastructure creates a comprehensive ecosystem that delivers seamless user experiences across all touchpoints and devices.</p>
                </div>
            </div>
        </section>

        <section>
            <h2>Latest Platform Innovations & Features</h2>
            <p>Stay ahead with cutting-edge parking technology innovations. Our platform continuously evolves with new AI capabilities, enhanced user experiences, and advanced integration options that keep you at the forefront of smart parking solutions.</p>
            <ul>
                <li>Machine learning-powered demand forecasting with 94% accuracy rates</li>
                <li>Native mobile applications for iOS and Android with offline capabilities</li>
                <li>IoT sensor compatibility for real-time occupancy data collection</li>
                <li>Advanced reporting and business intelligence tools for decision-making</li>
                <li>Comprehensive API access for custom integrations and third-party services</li>
                <li>Automated payment processing with multiple gateway support</li>
                <li>Multi-language support for global deployment and accessibility</li>
                <li>Advanced security features including end-to-end encryption</li>
            </ul>
        </section>

        <div class="internal-links">
            <h3>Explore Parkalgo Platform</h3>
            <p>Discover all the ways Parkalgo can transform your parking experience with intelligent solutions:</p>
            <a href="/dashboard">Dashboard</a>
            <a href="/plans">Pricing Plans</a>
            <a href="/auth/signup">Sign Up</a>
            <a href="/auth/login">Login</a>
            <a href="/features">Features</a>
            <a href="/contact">Contact</a>
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
            <a href="/faq">FAQ</a>
            <a href="/blog">Blog</a>
        </div>

        <section>
            <h2>Start Your AI-Powered Parking Journey Today</h2>
            <p>Join thousands of property managers, cities, and individual drivers already using our AI parking optimization platform. Transform your parking operations with intelligent algorithms, real-time data insights, and automated management solutions that deliver measurable results and improved user experiences.</p>
            <nav>
                <a href="/auth/signup" class="cta-button">Start Free Trial</a>
                <a href="/auth/login" class="cta-button">Sign In</a>
                <a href="/dashboard" class="cta-button">View Dashboard</a>
                <a href="/contact" class="cta-button">Contact Sales</a>
            </nav>
        </section>

        <footer style="margin-top: 4rem; padding-top: 2rem; border-top: 1px solid #e5e7eb; text-align: center;">
            <p><strong>Parkalgo - AI POWERED PARKING OPTIMIZATION</strong></p>
            <p>Intelligent parking solutions that help you park smarter, faster, and stress-free through advanced AI algorithms and real-time data processing.</p>
            <p>&copy; 2025 Parkalgo. All rights reserved. AI-powered parking optimization for smarter cities and businesses.</p>
        </footer>
    </main>
</body>
</html>`

// Comprehensive list of crawler user agents based on Strapi's SEO guide recommendations
const CRAWLER_PATTERNS = [
    'bot', 'crawler', 'spider', 'crawling', 'screaming', 'frog',
    'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider', 'yandexbot',
    'facebookexternalhit', 'twitterbot', 'rogerbot', 'linkedinbot', 'embedly',
    'quora link preview', 'showyoubot', 'outbrain', 'pinterest', 'slackbot',
    'vkshare', 'w3c_validator', 'redditbot', 'applebot', 'whatsapp', 'flipboard',
    'tumblr', 'bitlybot', 'skypeuripreview', 'nuzzel', 'discordbot', 'lighthouse',
    'pagespeed', 'gtmetrix', 'pingdom', 'uptimerobot', 'websitepulse'
] as const

function isCrawler(userAgent: string): boolean {
    if (!userAgent) return false
    
    const ua = userAgent.toLowerCase()
    return CRAWLER_PATTERNS.some(pattern => ua.includes(pattern))
}

// Generate blog post specific HTML with article content
function generateBlogPostHTML(post: any, canonicalUrl: string): string {
    const publishedDate = new Date(post.published_at || post.created_at).toISOString();
    const modifiedDate = new Date(post.updated_at || post.created_at).toISOString();
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Primary Meta Tags -->
    <title>${post.meta_title || `${post.title} | Parkalgo Blog`}</title>
    <meta name="description" content="${post.meta_description || post.excerpt || `Read about ${post.title} on the Parkalgo blog`}">
    <meta name="keywords" content="smart parking, AI optimization, parking technology, ${post.title.toLowerCase()}">
    <meta name="robots" content="index, follow">
    <meta name="author" content="Parkalgo">
    <link rel="canonical" href="${canonicalUrl}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="${canonicalUrl}">
    <meta property="og:title" content="${post.title}">
    <meta property="og:description" content="${post.excerpt || `Read about ${post.title} on the Parkalgo blog`}">
    <meta property="og:image" content="${post.featured_image || 'https://parkalgo.com/og-image.jpg'}">
    <meta property="og:site_name" content="Parkalgo">
    <meta property="article:published_time" content="${publishedDate}">
    <meta property="article:modified_time" content="${modifiedDate}">
    ${post.category ? `<meta property="article:section" content="${post.category}">` : ''}

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${canonicalUrl}">
    <meta property="twitter:title" content="${post.title}">
    <meta property="twitter:description" content="${post.excerpt || `Read about ${post.title} on the Parkalgo blog`}">
    <meta property="twitter:image" content="${post.featured_image || 'https://parkalgo.com/og-image.jpg'}">

    <!-- JSON-LD Structured Data for Article -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": "${post.title}",
        "description": "${post.excerpt || `Article about ${post.title}`}",
        "url": "${canonicalUrl}",
        "datePublished": "${publishedDate}",
        "dateModified": "${modifiedDate}",
        "author": {
            "@type": "Organization",
            "name": "Parkalgo"
        },
        "publisher": {
            "@type": "Organization",
            "name": "Parkalgo",
            "logo": {
                "@type": "ImageObject",
                "url": "https://parkalgo.com/logo.png"
            }
        },
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": "${canonicalUrl}"
        },
        "image": "${post.featured_image || 'https://parkalgo.com/og-image.jpg'}"
    }
    </script>
    
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #333; max-width: 1200px; margin: 0 auto; padding: 20px; }
        h1 { color: #1e40af; font-size: 2.5rem; margin-bottom: 1rem; }
        h2 { color: #374151; font-size: 1.8rem; margin: 2rem 0 1rem 0; }
        .article-meta { color: #6b7280; margin: 1rem 0; }
        .article-content { margin: 2rem 0; }
        .internal-links { margin: 2rem 0; background: #f3f4f6; padding: 1.5rem; border-radius: 8px; }
        .internal-links a { color: #1d4ed8; text-decoration: none; margin-right: 1rem; display: inline-block; margin-bottom: 0.5rem; }
    </style>
</head>
<body>
    <main>
        <article>
            <h1>${post.title}</h1>
            <div class="article-meta">
                <time datetime="${publishedDate}">Published ${new Date(publishedDate).toLocaleDateString()}</time>
                ${post.category ? ` | Category: ${post.category}` : ''}
            </div>
            
            ${post.featured_image ? `<img src="${post.featured_image}" alt="${post.title}" style="width: 100%; max-width: 800px; height: auto; margin: 1rem 0;">` : ''}
            
            <div class="article-content">
                ${post.excerpt ? `<h2>Overview</h2><p>${post.excerpt}</p>` : ''}
                
                <h2>Smart Parking Innovation</h2>
                <p>This article explores the latest developments in smart parking technology and how AI optimization is transforming urban mobility. Learn about the innovative approaches that are making parking more efficient and sustainable.</p>
                
                <h2>AI-Powered Solutions</h2>
                <p>Discover how artificial intelligence is revolutionizing parking management through predictive analytics, real-time optimization, and intelligent routing systems that benefit both drivers and city planners.</p>
                
                <h2>Industry Impact</h2>
                <p>Understanding the broader implications of smart parking technology on urban development, environmental sustainability, and the future of transportation in smart cities.</p>
                
                ${post.content ? `<div>${post.content.substring(0, 1000)}...</div>` : ''}
            </div>
        </article>
        
        <div class="internal-links">
            <h3>Related Articles & Resources</h3>
            <a href="https://parkalgo.com/">Home</a>
            <a href="https://parkalgo.com/blog">All Blog Posts</a>
            <a href="https://parkalgo.com/features">Smart Parking Features</a>
            <a href="https://parkalgo.com/plans">Pricing Plans</a>
            <a href="https://parkalgo.com/contact">Contact Us</a>
            <a href="https://parkalgo.com/dashboard">Dashboard</a>
            <a href="https://parkalgo.com/privacy">Privacy Policy</a>
            <a href="https://parkalgo.com/terms">Terms of Service</a>
        </div>
    </main>
</body>
</html>`;
}

export async function GET(request: NextRequest) {
    const userAgent = request.headers.get('user-agent') || ''
    
    // Always serve SEO HTML to crawlers (following Strapi's Next.js SEO guide)
    if (isCrawler(userAgent)) {
        // Get the original path from the referer or a custom header
        const referer = request.headers.get('referer') || ''
        const originalPath = request.nextUrl.searchParams.get('path') || 
                            (referer ? new URL(referer).pathname : '/');
        
        // Generate page-specific canonical URL
        const canonicalUrl = `https://parkalgo.com${originalPath === '/' ? '' : originalPath}`;
        
        // Generate page-specific title and description
        let pageTitle = 'AI Parking Optimization | Smart Algorithms | Parkalgo';
        let pageDescription = 'Transform parking efficiency with AI-powered algorithms. Smart parking management software that reduces congestion and maximizes revenue through intelligent automation for businesses and cities.';
        
        // Handle blog posts, categories, and tags
        if (originalPath.startsWith('/blog/') && originalPath !== '/blog') {
            try {
                if (originalPath.startsWith('/blog/category/')) {
                    // Blog category page
                    const categorySlug = originalPath.split('/blog/category/')[1];
                    pageTitle = `${categorySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} | Parking Blog | Parkalgo`;
                    pageDescription = `Read the latest articles about ${categorySlug.replace(/-/g, ' ')} in smart parking and AI optimization. Expert insights and industry analysis.`;
                } else if (originalPath.startsWith('/blog/tag/')) {
                    // Blog tag page
                    const tagSlug = originalPath.split('/blog/tag/')[1];
                    pageTitle = `${tagSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} | Parking Blog | Parkalgo`;
                    pageDescription = `Articles tagged with ${tagSlug.replace(/-/g, ' ')} in smart parking technology and AI optimization solutions.`;
                } else {
                    // Individual blog post
                    const postSlug = originalPath.split('/blog/')[1];
                    const post = await serverBlogService.getPostBySlug(postSlug);
                    if (post) {
                        pageTitle = post.meta_title || `${post.title} | Parkalgo Blog`;
                        pageDescription = post.meta_description || post.excerpt || `Read about ${post.title} on the Parkalgo blog - insights into smart parking technology and AI optimization.`;
                    } else {
                        pageTitle = 'Blog Post | Parkalgo';
                        pageDescription = 'Smart parking insights and AI optimization updates from the Parkalgo team.';
                    }
                }
            } catch (error) {
                console.error('Error fetching blog data for SEO:', error);
                // Fallback to generic blog content
                pageTitle = 'Parking Blog | AI Insights & Updates | Parkalgo';
                pageDescription = 'Smart parking insights, AI optimization updates, and industry analysis from the Parkalgo team.';
            }
        } else if (originalPath === '/blog') {
            pageTitle = 'Parking Industry Blog | AI Insights & Updates | Parkalgo';
            pageDescription = 'Latest insights, updates, and innovations in AI-powered parking optimization. Expert analysis, industry trends, and smart parking technology developments.';
        } else if (originalPath === '/features') {
            pageTitle = 'AI Parking Features | Smart Algorithms & Technology | Parkalgo';
            pageDescription = 'Comprehensive features of our AI parking optimization platform. Advanced analytics, real-time monitoring, dynamic pricing, and intelligent automation capabilities.';
        } else if (originalPath === '/plans') {
            pageTitle = 'Parking Software Pricing | AI Optimization Plans | Parkalgo';
            pageDescription = 'Choose the perfect AI parking optimization plan for your needs. From free starter plans to enterprise solutions with advanced features and dedicated support.';
        } else if (originalPath === '/contact') {
            pageTitle = 'Contact Parkalgo | AI Parking Solutions Support';
            pageDescription = 'Get in touch with our AI parking optimization experts. Sales inquiries, technical support, and partnership opportunities available.';
        } else if (originalPath === '/faq') {
            pageTitle = 'Parkalgo FAQ | AI Parking Questions & Answers';
            pageDescription = 'Find answers to frequently asked questions about our AI parking optimization platform, features, pricing, and implementation.';
        } else if (originalPath === '/privacy') {
            pageTitle = 'Privacy Policy | Parkalgo Data Protection';
            pageDescription = 'Learn how Parkalgo protects your privacy and handles your data. Comprehensive privacy policy and data protection information.';
        } else if (originalPath === '/terms') {
            pageTitle = 'Terms of Service | Parkalgo Legal Terms';
            pageDescription = 'Read Parkalgo terms of service, user agreement, and legal conditions for using our smart parking platform.';
        } else if (originalPath === '/pricing') {
            pageTitle = 'Parking Software Pricing | AI Optimization Plans | Parkalgo';
            pageDescription = 'Choose the perfect AI parking optimization plan for your needs. From free starter plans to enterprise solutions with advanced features and dedicated support.';
        } else if (originalPath === '/dashboard') {
            pageTitle = 'Parking Dashboard | Smart Analytics & Monitoring | Parkalgo';
            pageDescription = 'Access your smart parking dashboard with real-time analytics, occupancy monitoring, and AI-powered insights for optimal parking management.';
        }
        
        // Generate dynamic SEO HTML with page-specific canonical URL (updated v2.2)
        let dynamicSEOHTML;
        
        // For blog posts, generate richer content
        if (originalPath.startsWith('/blog/') && originalPath !== '/blog' && !originalPath.startsWith('/blog/category/') && !originalPath.startsWith('/blog/tag/')) {
            try {
                const postSlug = originalPath.split('/blog/')[1];
                const post = await serverBlogService.getPostBySlug(postSlug);
                
                if (post) {
                    // Generate blog post specific HTML
                    dynamicSEOHTML = generateBlogPostHTML(post, canonicalUrl);
                } else {
                    // Fallback to standard template
                    dynamicSEOHTML = SEO_HTML
                        .replace('href="https://parkalgo.com/"', `href="${canonicalUrl}"`)
                        .replace('<title>AI Parking Optimization | Smart Algorithms | Parkalgo</title>', `<title>${pageTitle}</title>`)
                        .replace(/content="Transform parking efficiency[^"]*"/, `content="${pageDescription}"`);
                }
            } catch (error) {
                console.error('Error generating blog post HTML:', error);
                dynamicSEOHTML = SEO_HTML
                    .replace('href="https://parkalgo.com/"', `href="${canonicalUrl}"`)
                    .replace('<title>AI Parking Optimization | Smart Algorithms | Parkalgo</title>', `<title>${pageTitle}</title>`)
                    .replace(/content="Transform parking efficiency[^"]*"/, `content="${pageDescription}"`);
            }
        } else {
            // Standard template for other pages
            dynamicSEOHTML = SEO_HTML
                .replace('href="https://parkalgo.com/"', `href="${canonicalUrl}"`)
                .replace('<title>AI Parking Optimization | Smart Algorithms | Parkalgo</title>', `<title>${pageTitle}</title>`)
                .replace(/content="Transform parking efficiency[^"]*"/, `content="${pageDescription}"`);
        }
        
        return new NextResponse(dynamicSEOHTML, {
            status: 200,
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 'public, max-age=3600, s-maxage=86400',
                'X-Robots-Tag': 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
                'Vary': 'User-Agent',
            },
        })
    }
    
    // For human users, return a 404 since this endpoint is only for bots
    return new NextResponse('Not Found', {
        status: 404,
        headers: {
            'Content-Type': 'text/plain',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
    })
}
