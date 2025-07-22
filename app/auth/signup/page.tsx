import { SignUpForm } from "@/components/auth/signup-form"
import Link from "next/link"
import { MapPin } from "lucide-react"
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up | Parkalgo - AI Parking Optimization',
  description: 'Create your free Parkalgo account to access AI-powered parking solutions, smart algorithms, and real-time parking management tools.',
  keywords: 'Parkalgo signup, create parking account, AI parking registration, smart parking solutions signup',
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://parkalgo.com/auth/signup'
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
        </div>

        <SignUpForm />

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
