import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <Loader2 className="w-16 h-16 animate-spin text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Park Algo</h2>
          <p className="text-gray-600">Loading your smart parking solution...</p>
        </div>
      </div>
    </div>
  )
}
