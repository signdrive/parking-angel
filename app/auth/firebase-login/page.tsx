import { FirebaseLoginForm } from "@/components/auth/firebase-login-form"
import Link from "next/link"
import { MapPin } from "lucide-react"

export default function FirebaseLoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <MapPin className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Parking Angel</span>
            <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
              FIREBASE
            </span>
          </Link>
        </div>

        <FirebaseLoginForm />

        <div className="text-center">
          <p className="text-sm text-gray-600">
            {"Don't have an account? "}
            <Link href="/auth/firebase-signup" className="text-blue-600 hover:underline">
              Sign up with Firebase
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
