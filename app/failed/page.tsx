'use client'

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { XCircle, RefreshCw } from "lucide-react";
import { SiteFooter } from "@/components/layout/site-footer";

export default function PaymentFailedPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Payment failure already handled by redirect
  }, [sessionId, error]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-red-50 to-pink-100">
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Failed</h1>            <p className="text-gray-600 mb-6">
              {error ? `Error: ${error}` : 'We were unable to process your payment. Please check your payment details and try again.'}
            </p>
          <div className="space-y-3">
            <Link href="/subscription">
              <Button size="lg" className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg" className="w-full">
                Contact Support
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
