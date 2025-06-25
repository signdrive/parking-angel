"use client"

import { Shield } from "lucide-react"

interface LoadingSpinnerProps {
  text?: string;
}

export function LoadingSpinner({ text = "Loading data..." }: LoadingSpinnerProps) {
  return (
    <div className="min-h-[200px] flex items-center justify-center">
      <div className="text-center">
        <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
        <p className="text-gray-600">{text}</p>
      </div>
    </div>
  )
}
