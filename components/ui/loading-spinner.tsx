"use client"

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

export function LoadingSpinner({ size = "md", className, text }: LoadingSpinnerProps) {
  const sizeClass = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  }[size];

  return (
    <div className="flex items-center gap-2">
      <Loader2 className={cn("animate-spin", sizeClass, className)} />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  );
}
