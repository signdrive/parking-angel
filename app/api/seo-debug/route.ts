// Debug version to test the logic
import { NextRequest, NextResponse } from 'next/server'

const CRAWLER_PATTERNS = [
    'bot', 'crawler', 'spider', 'crawling', 'screaming', 'frog',
    'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider', 'yandexbot',
] as const

function isCrawler(userAgent: string): boolean {
    if (!userAgent) return false
    
    const ua = userAgent.toLowerCase()
    return CRAWLER_PATTERNS.some(pattern => ua.includes(pattern))
}

export async function GET(request: NextRequest) {
    const userAgent = request.headers.get('user-agent') || ''
    
    // Always serve SEO HTML to crawlers
    if (isCrawler(userAgent)) {
        // Get the original path from query parameter
        const originalPath = request.nextUrl.searchParams.get('path') || '/';
        
        // Generate page-specific canonical URL
        const canonicalUrl = `https://parkalgo.com${originalPath === '/' ? '' : originalPath}`;
        
        // Generate page-specific title and description
        let pageTitle = 'AI Parking Optimization | Smart Algorithms | Parkalgo';
        let pageDescription = 'Transform parking efficiency with AI-powered algorithms. Smart parking management software that reduces congestion and maximizes revenue through intelligent automation for businesses and cities.';
        
        if (originalPath === '/blog') {
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
        }
        
        // Simple debug HTML to test logic
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${pageTitle}</title>
    <meta name="description" content="${pageDescription}" />
    <link rel="canonical" href="${canonicalUrl}" />
</head>
<body>
    <h1>DEBUG: Path was ${originalPath}</h1>
    <p>Title: ${pageTitle}</p>
    <p>Canonical: ${canonicalUrl}</p>
    <p>UserAgent detected as crawler: ${isCrawler(userAgent)}</p>
</body>
</html>`;
        
        return new NextResponse(html, {
            status: 200,
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 'public, max-age=60', // Short cache for testing
            },
        });
    }
    
    // For non-crawlers
    return new NextResponse('This endpoint is for crawlers only', {
        status: 200,
        headers: {
            'Content-Type': 'text/plain',
        },
    });
}
