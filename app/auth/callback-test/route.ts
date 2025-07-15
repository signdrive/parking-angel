// Simple callback test
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');
  
  console.log('🔍 Callback test received:', {
    hasCode: !!code,
    hasError: !!error,
    url: request.url,
    params: Object.fromEntries(url.searchParams.entries())
  });

  if (error) {
    return NextResponse.redirect(new URL(`/auth/error?error=${error}`, url.origin));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/auth/error?error=no_code', url.origin));
  }

  // For testing, just redirect to dashboard with success message
  return NextResponse.redirect(new URL('/dashboard?auth=success', url.origin));
}
