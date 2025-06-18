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
        
        if (error) {
          console.error('OAuth error:', error, errorDescription);
          router.push(`/auth/login?error=${encodeURIComponent(error)}&message=${encodeURIComponent(errorDescription || '')}`);
          return;
        }

        // Get session to complete the OAuth flow
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

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
      <div className="text-center">
        <h2 className="text-xl font-semibold">Completing sign in...</h2>
        <p className="text-sm text-gray-500">Please wait while we redirect you.</p>
      </div>
    </div>
  );
}
