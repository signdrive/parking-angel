import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { SiteFooter } from "@/components/layout/site-footer";

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for your purchase. Your premium features are now unlocked.
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="w-full">Go to Dashboard</Button>
          </Link>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
