import { LoginForm } from "@/components/auth/login-form"
import Link from "next/link"
import { MapPin } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign In | Park Algo - Smart Parking Solutions",
  description:
    "Sign in to your Park Algo account to access intelligent parking management and real-time spot availability.",
  keywords: "parking, login, sign in, smart parking, Park Algo",
  robots: "noindex, nofollow", // Don't index login pages
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6 hover:opacity-80 transition-opacity">
            <MapPin className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Park Algo</span>
          </Link>
          <p className="text-sm text-gray-600">Intelligent Parking Management System</p>
        </div>

        <LoginForm />

        <div className="text-center text-xs text-gray-500">
          <p>© 2024 Park Algo. All rights reserved.</p>
          <p className="mt-1">
            <Link href="/privacy" className="hover:underline">
              Privacy Policy
            </Link>
            {" • "}
            <Link href="/terms" className="hover:underline">
              Terms of Service
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
