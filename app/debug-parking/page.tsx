import { DatabaseQueryDebugger } from "@/components/debug/database-query-debugger"

export default function DebugParkingPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Parking Database Debugger</h1>
          <p className="text-gray-600">Diagnose and fix the HTTP 400 errors from parking_spots queries</p>
        </div>

        <DatabaseQueryDebugger />

        <div className="mt-8 p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Quick API Test</h2>
          <p className="text-gray-600 mb-4">Test the debug API endpoint directly:</p>
          <code className="block p-3 bg-gray-100 rounded text-sm">GET /api/debug/parking-spots</code>
        </div>
      </div>
    </div>
  )
}
