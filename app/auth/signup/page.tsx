import { SignUpForm } from "@/components/auth/signup-form"
import Link from "next/link"
import { MapPin } from "lucide-react"
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up | Parkalgo - AI Parking',
  description: 'Create your free Parkalgo account for AI-powered parking solutions, smart algorithms, and real-time management tools.',
  keywords: 'Parkalgo signup, create parking account, AI parking registration, smart parking solutions signup',
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: 'https://parkalgo.com/auth/signup',
  },
  openGraph: {
    title: 'Sign Up | Parkalgo - AI Parking Optimization',
    description: 'Create your free account to access AI-powered parking solutions',
    url: 'https://parkalgo.com/auth/signup',
    siteName: 'Parkalgo',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Sign Up | Parkalgo',
    description: 'Create your free account to access AI-powered parking solutions',
  },
}

export default function SignUpPage() {
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
            Create Your Free Account
          </h1>
          <h2 className="text-lg text-gray-600 mb-6">
            Start using AI-powered parking solutions today
          </h2>
        </div>

        <SignUpForm />

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-blue-600 hover:underline">
              Sign in
            </Link>
            {" to access your dashboard."}
          </p>
          
          {/* SEO: Added more descriptive content */}
          <div className="mt-6 text-xs text-gray-500 max-w-sm mx-auto">
            <p>Get instant access to intelligent parking management features including real-time availability, route optimization, EV charging station locations, and predictive analytics. No credit card required for your free starter plan.</p>
            
            {/* SEO: Added internal links for better discoverability */}
            <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs">
              <Link href="/features" className="text-blue-600 hover:underline">Features</Link>
              <span className="text-gray-300">•</span>
              <Link href="/pricing" className="text-blue-600 hover:underline">Pricing Plans</Link>
              <span className="text-gray-300">•</span>
              <Link href="/smart-parking-solutions" className="text-blue-600 hover:underline">Smart Solutions</Link>
              <span className="text-gray-300">•</span>
              <Link href="/parking-management-demo" className="text-blue-600 hover:underline">Demo</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
