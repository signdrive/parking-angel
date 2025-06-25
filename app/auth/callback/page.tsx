"use client";

import { Suspense } from "react";
import AuthCallbackClient from "./client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function AuthCallbackPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
      <Suspense fallback={<LoadingSpinner />}>
        <AuthCallbackClient />
      </Suspense>
    </div>
  );
}
