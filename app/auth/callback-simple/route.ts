import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('🔍 Simple callback started');
  
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('return_to') ?? '/dashboard';
  const error = searchParams.get('error');

  console.log('🔍 Callback parameters:', {
    hasCode: !!code,
    codeLength: code?.length || 0,
    next,
    error,
    allParams: Object.fromEntries(searchParams.entries())
  });

  // Check for OAuth error first
  if (error) {
    console.error('OAuth error received:', error);
    return NextResponse.redirect(new URL(`/auth/error?message=OAuth error: ${error}`, origin));
  }

  if (code) {
    console.log('🔍 Processing code...');
    
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );

    console.log('🔍 Attempting code exchange...');
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (exchangeError) {
      console.error('Code exchange error:', {
        message: exchangeError.message,
        status: exchangeError.status,
        code: exchangeError.code
      });
      
      return NextResponse.redirect(new URL(`/auth/error?message=Auth failed: ${exchangeError.message}`, origin));
    }
    
    if (data.session) {
      console.log('✅ Authentication successful:', {
        userId: data.user?.id,
        email: data.user?.email
      });
      
      return NextResponse.redirect(new URL(next, origin));
    }
  }

  console.error('No code parameter or authentication failed');
  return NextResponse.redirect(new URL('/auth/error?message=No authentication code received', origin));
}
