import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const host = request.headers.get('host') || '';
  const protocol = request.headers.get('x-forwarded-proto') || 'https';
  const userAgent = request.headers.get('user-agent') || '';

  // Critical: Always redirect www to non-www (Google Search Console fix)
  if (host.startsWith('www.')) {
    const nonWwwUrl = new URL(`https://parkalgo.com${pathname}${search}`);
    return NextResponse.redirect(nonWwwUrl, 301);
  }

  // Redirect HTTP to HTTPS
  if (protocol === 'http' && host === 'parkalgo.com') {
    const httpsUrl = new URL(`https://parkalgo.com${pathname}${search}`);
    return NextResponse.redirect(httpsUrl, 301);
  }

  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Add SEO headers for better indexing
  const canonicalPath = pathname === '/' ? '/' : pathname;
  response.headers.set('x-canonical-url', `https://parkalgo.com${canonicalPath}`);
  response.headers.set('x-robots-tag', 'index, follow, max-image-preview:large, max-snippet:-1');
  
  // Check if it's a known SEO crawler
  const isBot = /bot|crawler|spider|crawling|screaming frog|googlebot|bingbot|yandexbot|facebookexternalhit|twitterbot|whatsapp|linkedinbot|pinterest|slackbot|redditbot|applebot|duckduckbot|baiduspider|sogou|exalead|teoma|alexa|mj12bot|dotbot|ahrefsbot|semrushbot|majesticSEO|blekkobot|ia_archiver|wayback|archive\.org/i.test(userAgent.toLowerCase());
  
  // Define pages that should be served to crawlers via SEO endpoint
  const seoPages = ['/', '/blog', '/features', '/plans', '/contact', '/faq', '/privacy', '/terms', '/pricing', '/dashboard'];
  const isBlogPost = pathname.startsWith('/blog/') && pathname !== '/blog';
  const isBlogCategory = pathname.startsWith('/blog/category/');
  const isBlogTag = pathname.startsWith('/blog/tag/');
  
  // Rewrite crawlers to SEO endpoint for main pages and blog content (no redirect to avoid 3xx warning)
  if (isBot && (seoPages.includes(pathname) || isBlogPost || isBlogCategory || isBlogTag)) {
    const seoUrl = new URL(`https://parkalgo.com/api/seo`);
    seoUrl.searchParams.set('path', pathname);
    return NextResponse.rewrite(seoUrl);
  }
  
  // Special handling for bots to ensure proper rendering
  if (isBot) {
    response.headers.set('x-bot-detected', 'true');
    response.headers.set('cache-control', 'public, max-age=3600, must-revalidate');
  }
  response.headers.set('referrer-policy', 'strict-origin-when-cross-origin');

  // Debug: Log request cookies before Supabase initialization
  const isAdminRoute = pathname.startsWith('/admin');
  if (isAdminRoute) {
    console.log('\n=== MIDDLEWARE DEBUG - ADMIN ROUTE ===');
    console.log('Path:', pathname);
    console.log('Request cookies before Supabase:');
    const allCookies = request.cookies.getAll();
    allCookies.forEach(cookie => {
      console.log(`  ${cookie.name}: ${cookie.value?.substring(0, 50)}${cookie.value?.length > 50 ? '...' : ''}`);
    });
    console.log('Total cookies:', allCookies.length);
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const cookies = request.cookies.getAll();
          if (isAdminRoute) {
            console.log('Supabase getAll() called, returning', cookies.length, 'cookies');
          }
          return cookies;
        },
        setAll(cookiesToSet) {
          if (isAdminRoute) {
            console.log('Supabase setAll() called with', cookiesToSet.length, 'cookies:');
            cookiesToSet.forEach(({ name, value, options }) => {
              console.log(`  Setting: ${name} = ${value?.substring(0, 50)}${value?.length > 50 ? '...' : ''}`);
              console.log(`  Options:`, options);
            });
          }
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Get user session
  const { data: { user }, error } = await supabase.auth.getUser();

  // Debug: Log auth result and response cookies for admin routes
  if (isAdminRoute) {
    console.log('\nAuth result:');
    console.log('  User:', user ? `${user.id} (${user.email})` : 'null');
    console.log('  Error:', error ? error.message : 'none');
    
    console.log('\nResponse cookies after Supabase auth:');
    const responseCookies = response.cookies.getAll();
    responseCookies.forEach(cookie => {
      console.log(`  ${cookie.name}: ${cookie.value?.substring(0, 50)}${cookie.value?.length > 50 ? '...' : ''}`);
    });
    console.log('Total response cookies:', responseCookies.length);
    console.log('=== END MIDDLEWARE DEBUG ===\n');
  }

  // Only log auth errors for protected routes, not public pages
  const protectedRoutes = ['/dashboard', '/admin', '/profile', '/settings'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  if (error && isProtectedRoute) {
    console.log('Middleware auth error on protected route:', error.message);
  }

  return response;
}

// Ensure the middleware is only called for relevant paths.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - /auth/callback (the auth callback route, to avoid interference)
     * - /auth/error (the auth error page)
     */
    '/((?!_next/static|_next/image|favicon.ico|auth/callback|auth/error).*)',
  ],
};
