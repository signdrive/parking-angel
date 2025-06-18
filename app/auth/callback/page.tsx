"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
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
          router.push('/auth/login');
          return;
        }

        if (!session) {
          console.error('No session established');
          router.push('/auth/login');
          return;
        }

        console.log('Authentication successful');
        router.push('/dashboard');
      } catch (err) {
        console.error('Unexpected error:', err);
        router.push('/auth/login');
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-10 rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight">
            Completing sign in...
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please wait while we authenticate your session
          </p>
        </div>
      </div>
    </div>
  );
}
