import { LoginForm } from "@/components/auth/login-form"
import Link from "next/link"
import { MapPin } from "lucide-react"
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login | Parkalgo - AI Parking Optimization',
  description: 'Sign in to your Parkalgo account to access AI-powered parking management dashboard, real-time analytics, and smart parking solutions.',
  keywords: 'Parkalgo login, parking management login, AI parking dashboard access, smart parking account',
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://parkalgo.com/auth/login'
  },
  openGraph: {
    title: 'Login | Parkalgo - AI Parking Optimization',
    description: 'Sign in to access your AI-powered parking management dashboard',
    url: 'https://parkalgo.com/auth/login',
    siteName: 'Parkalgo',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Login | Parkalgo',
    description: 'Sign in to access your AI-powered parking management dashboard',
  },
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <MapPin className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Park Algo</span>
          </Link>
        </div>

        <LoginForm />

        <div className="text-center">
          <p className="text-sm text-gray-600">
            {"Don't have an account? "}
            <Link href="/auth/signup" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
