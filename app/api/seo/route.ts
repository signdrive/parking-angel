import { NextRequest, NextResponse } from 'next/server'

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

export async function GET(request: NextRequest) {
    const userAgent = request.headers.get('user-agent') || ''
    
    // Always serve SEO HTML to crawlers (following Strapi's Next.js SEO guide)
    if (isCrawler(userAgent)) {
        return new NextResponse(SEO_HTML, {
            status: 200,
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 'public, max-age=3600, s-maxage=86400',
                'X-Robots-Tag': 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
                'Vary': 'User-Agent',
            },
        })
    }
    
    // For human users, serve a lightweight redirect page
    const redirectHTML = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Redirecting to Parkalgo...</title>
    <meta http-equiv="refresh" content="0;url=/">
    <script>window.location.href='/';</script>
</head>
<body>
    <p>Redirecting to <a href="/">Parkalgo</a>...</p>
</body>
</html>`
    
    return new NextResponse(redirectHTML, {
        status: 200,
        headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
    })
}
