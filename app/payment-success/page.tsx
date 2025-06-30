"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { CheckCircle, XCircle, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import Confetti from 'react-confetti';

const StatusMessage = ({ icon, title, message }: { icon: React.ReactNode, title: string, message: string }) => (
  <div className="text-center">
    {icon}
    <h1 className="text-2xl font-bold mt-4">{title}</h1>
    <p className="text-muted-foreground mt-2">{message}</p>
  </div>
);

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, forceRefresh } = useAuth();

  const sessionId = searchParams.get("session_id");
  const tier = searchParams.get("tier");

  const [status, setStatus] = useState<"verifying" | "success" | "error" | "user_updated">("verifying");
  const [error, setError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!sessionId || !tier) {
      setError("Missing session ID or tier. Please return to the dashboard.");
      setStatus("error");
      return;
    }

    let verificationTimeout: NodeJS.Timeout;

    const verifySession = async (attempt = 1) => {
      try {
        const response = await fetch('/api/stripe/verify-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId }),
        });

        if (!response.ok) {
          const { error } = await response.json();
          throw new Error(error || "Verification request failed.");
        }

        const data = await response.json();

        if (data.success) {
          setStatus("success");
          await forceRefresh(); // Force a refresh of user data
        } else {
          throw new Error(data.error || "Verification failed.");
        }
      } catch (err: any) {
        console.error(`Verification attempt ${attempt} failed:`, err);
        if (attempt < 3) {
          verificationTimeout = setTimeout(() => verifySession(attempt + 1), 2000 * attempt);
        } else {
          setError("Failed to verify your payment after multiple attempts. Please contact support.");
          setStatus("error");
        }
      }
    };

    verifySession();

    return () => {
      clearTimeout(verificationTimeout);
    };
  }, [sessionId, tier, forceRefresh]);

  useEffect(() => {
    if (status === "success" && user?.plan === tier) {
      setStatus("user_updated");
      setShowConfetti(true);
    }
  }, [user, status, tier]);

  const renderStatus = () => {
    switch (status) {
      case "verifying":
        return <StatusMessage icon={<Loader className="h-12 w-12 mx-auto animate-spin text-primary" />} title="Verifying Your Payment" message="Please wait while we confirm your subscription. This may take a moment..." />;
      case "success":
        return <StatusMessage icon={<Loader className="h-12 w-12 mx-auto animate-spin text-primary" />} title="Payment Confirmed!" message="Finalizing your account setup. Your new plan should appear shortly." />;
      case "user_updated":
        return <StatusMessage icon={<CheckCircle className="h-12 w-12 mx-auto text-green-500" />} title="Subscription Activated!" message={`Welcome to the ${tier} plan! You can now access all your new features.`} />;
      case "error":
        return <StatusMessage icon={<XCircle className="h-12 w-12 mx-auto text-destructive" />} title="Verification Failed" message={error || "An unknown error occurred."} />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      {showConfetti && <Confetti recycle={false} onConfettiComplete={() => setShowConfetti(false)} />}
      <div className="w-full max-w-md">
        {renderStatus()}
        {(status === "user_updated" || status === "error") && (
          <Button onClick={() => router.push('/dashboard')} className="w-full mt-6">
            Go to Dashboard
          </Button>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
