"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from '@supabase/ssr';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Create a fresh Supabase client for the callback
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            cookies: {
              get(name: string) {
                const cookie = document.cookie
                  .split('; ')
                  .find((row) => row.startsWith(`${name}=`))
                return cookie ? cookie.split('=')[1] : ''
              },
              set(name: string, value: string, options: { path?: string; maxAge?: number }) {
                document.cookie = `${name}=${value}; path=${options.path || '/'}; max-age=${options.maxAge || 31536000}`
              },
              remove(name: string, options: { path?: string }) {
                document.cookie = `${name}=; path=${options.path || '/'}; expires=Thu, 01 Jan 1970 00:00:01 GMT`
              },
            },
          }
        )

        // Check if we have an error from the OAuth provider
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        const code = searchParams.get('code');
        
        if (error) {
          console.error('OAuth error:', error, errorDescription);
          router.push(`/auth/login?error=${encodeURIComponent(error)}&message=${encodeURIComponent(errorDescription || '')}`);
          return;
        }

        if (!code) {
          console.error('No code parameter found');
          router.push('/auth/login');
          return;
        }

        // Exchange code for session
        const { data: { session }, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

        if (sessionError) {
          console.error('Session error:', sessionError);
          router.push(`/auth/login?error=${encodeURIComponent(sessionError.message)}`);
          return;
        }

        if (!session) {
          console.error('No session established');
          router.push('/auth/login?error=no_session');
          return;
        }

        console.log('Authentication successful');
        router.push('/dashboard');
      } catch (err) {
        console.error('Unexpected error:', err);
        router.push('/auth/login?error=unexpected_error');
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-background p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Processing your login...</h1>
        <p className="text-muted-foreground">Please wait while we complete your authentication.</p>
      </div>
    </div>
  );
}
