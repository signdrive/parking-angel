import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  console.log('🔍 New callback route started');
  
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const returnTo = searchParams.get('return_to') || '/dashboard';
  const error = searchParams.get('error');

  console.log('🔍 Callback parameters:', {
    hasCode: !!code,
    codeLength: code?.length || 0,
    returnTo,
    error,
    allParams: Object.fromEntries(searchParams.entries())
  });

  if (error) {
    console.error('OAuth error:', error);
    return NextResponse.redirect(new URL(`/auth/error?error=${error}`, origin));
  }

  if (code) {
    console.log('🔍 Processing auth code...');
    
    const response = NextResponse.redirect(new URL(returnTo, origin));
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            response.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            response.cookies.set({ name, value: '', ...options });
          },
        },
      }
    );

    try {
      // Use exchangeCodeForSession which handles PKCE automatically
      console.log('🔍 Exchanging code for session...');
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (exchangeError) {
        console.error('Code exchange error:', {
          message: exchangeError.message,
          status: exchangeError.status,
          code: exchangeError.code
        });
        
        // Return specific error message
        const errorMsg = exchangeError.message.includes('PKCE') 
          ? 'PKCE verification failed'
          : exchangeError.message;
        
        return NextResponse.redirect(new URL(`/auth/error?error=session_error&description=${encodeURIComponent(errorMsg)}`, origin));
      }

      if (!data.session) {
        console.error('No session data received');
        return NextResponse.redirect(new URL('/auth/error?error=no_session', origin));
      }

      console.log('✅ Auth successful:', {
        hasSession: !!data.session,
        userId: data.user?.id
      });

      // Return the response with cookies set
      return response;
    } catch (err) {
      console.error('Unexpected error:', err);
      return NextResponse.redirect(new URL('/auth/error?error=unknown', origin));
    }
  }

  console.error('No code parameter found');
  return NextResponse.redirect(new URL('/auth/error?error=no_code', origin));
}
