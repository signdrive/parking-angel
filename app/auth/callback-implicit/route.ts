import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getRedirectUrl } from '@/lib/url-utils';

export async function GET(request: NextRequest) {
  console.log('🔍 Implicit callback route hit - redirecting to main callback');
  
  const { searchParams } = new URL(request.url);
  
  // Get all parameters and redirect to main callback
  const params = new URLSearchParams();
  searchParams.forEach((value, key) => {
    params.append(key, value);
  });
  
  const redirectUrl = `/auth/callback?${params.toString()}`;
  console.log('Redirecting to main callback:', redirectUrl);
  
  return NextResponse.redirect(getRedirectUrl(redirectUrl));
}
