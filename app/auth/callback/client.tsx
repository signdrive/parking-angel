'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getBrowserClient } from '@/lib/supabase/browser';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/components/ui/use-toast';

export default function AuthCallbackClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const code = searchParams.get('code');
  const processed = useRef(false);

  useEffect(() => {
    if (code && !processed.current) {
      processed.current = true;
      console.log('Found auth code, handling session...');
      
      const supabase = getBrowserClient();
      
      // For PKCE flow, we need to let Supabase handle the session automatically
      // instead of manually calling exchangeCodeForSession
      supabase.auth.getSession().then(({ data: { session }, error }) => {
        if (error) {
          console.error('Error getting session:', error);
          toast({
            title: "Authentication Error",
            description: error.message || "There was a problem signing you in. Please try again.",
            variant: "destructive",
          });
          router.replace('/auth/login');
        } else if (session) {
          console.log('Session established successfully');
          router.replace('/dashboard');
        } else {
          // No session yet, try to exchange the code
          supabase.auth.exchangeCodeForSession(code).then(({ error: exchangeError }) => {
            if (exchangeError) {
              console.error('Error exchanging code:', exchangeError);
              toast({
                title: "Authentication Error",
                description: exchangeError.message || "There was a problem signing you in. Please try again.",
                variant: "destructive",
              });
              router.replace('/auth/login');
            } else {
              console.log('Code exchange successful');
              router.replace('/dashboard');
            }
          });
        }
      });
    }
  }, [code, router, toast]);

  if (!code) {
    // This can happen if the user navigates to the callback URL directly
    // or if the code is missing for some reason. Redirect to login.
    console.log("No auth code found - redirecting to login (likely direct visit)");
    router.replace("/auth/login");
    return <LoadingSpinner text="Redirecting to login..." />;
  }

  return <LoadingSpinner text="Finalizing login..." />;
}
