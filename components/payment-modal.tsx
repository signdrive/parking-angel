import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';
import { useRouter } from 'next/navigation';

export function PaymentModal({ open, onOpenChange, plan, amount, priceId }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: string;
  amount: number;
  priceId: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const router = useRouter();

  async function handleSubscribe() {
    if (!user) {
      // Create a return URL that goes to subscription page with the plan selected
      const returnUrl = `/subscription?plan=${plan.toLowerCase()}`;
      router.push(`/auth/login?return_to=${encodeURIComponent(returnUrl)}`);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("Stripe error:", data.error);
        setError(data.error || "Failed to initialize payment.");
      }
    } catch (err) {
      console.error("Network or JS error:", err);
      setError("Failed to initialize payment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Subscribe to {plan} Plan</DialogTitle>
          <DialogDescription>
            {amount > 0 ? `Pay $${amount} to unlock ${plan} features.` : 'No payment required.'}
          </DialogDescription>
        </DialogHeader>
        
        {/* Test Mode Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-2 text-amber-800">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="font-medium text-sm">Beta Testing Mode</span>
          </div>
          <p className="text-xs text-amber-700 mt-1">
            This is a test payment. No actual charges will be processed during our beta phase.
          </p>
        </div>
        
        {loading && <div className="text-center py-8">Initializing payment...</div>}
        {error && <div className="text-red-500 text-center py-4">{error}</div>}
        <div className="text-center py-8">
          <Button
            size="lg"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleSubscribe}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Continue to Test Payment'}
          </Button>
        </div>
        <DialogClose asChild>
          <Button variant="outline" className="mt-4 w-full" disabled={loading}>Cancel</Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
