import { LoginForm } from "@/components/auth/login-form"
import Link from "next/link"
import { MapPin } from "lucide-react"
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login | Parkalgo - AI Parking',
  description: 'Sign in to your Parkalgo account for AI-powered parking management, real-time analytics, and smart solutions.',
  keywords: 'Parkalgo login, parking management login, AI parking dashboard access, smart parking account',
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: 'https://parkalgo.com/auth/login',
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
          
          {/* SEO: Added H1 tag for better ranking */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sign In to Your Account
          </h1>
          <h2 className="text-lg text-gray-600 mb-6">
            Access your AI-powered parking management dashboard
          </h2>
        </div>

        <LoginForm />

        <div className="text-center">
          <p className="text-sm text-gray-600">
            {"Don't have an account? "}
            <Link href="/auth/signup" className="text-blue-600 hover:underline">
              Sign up for free
            </Link>
            {" to get started with smart parking solutions."}
          </p>
          
          {/* SEO: Added more descriptive content */}
          <div className="mt-6 text-xs text-gray-500 max-w-sm mx-auto">
            <p>Join thousands of users who trust Parkalgo for intelligent parking management. Our AI-powered platform helps you find, reserve, and optimize parking spaces with real-time data and advanced algorithms.</p>
            
            {/* SEO: Added internal links for better discoverability */}
            <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs">
              <Link href="/features" className="text-blue-600 hover:underline">Features</Link>
              <span className="text-gray-300">•</span>
              <Link href="/pricing" className="text-blue-600 hover:underline">Pricing</Link>
              <span className="text-gray-300">•</span>
              <Link href="/blog" className="text-blue-600 hover:underline">Blog</Link>
              <span className="text-gray-300">•</span>
              <Link href="/ai-parking-optimization" className="text-blue-600 hover:underline">AI Solutions</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
