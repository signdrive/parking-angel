import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This route handles malformed URLs with duplicate ports
export async function GET(request: NextRequest) {
  console.log('🔧 Handling malformed URL redirect');
  
  const { searchParams } = new URL(request.url);
  const message = searchParams.get('message') || 'Authentication error';
  
  // Redirect to the correct auth error page
  const correctUrl = `https://automatic-umbrella-66rqvg9j35545-3000.app.github.dev/auth/error?message=${encodeURIComponent(message)}`;
  
  console.log('Redirecting to correct URL:', correctUrl);
  
  return NextResponse.redirect(correctUrl);
}

// Handle both GET and POST requests
export const POST = GET;
