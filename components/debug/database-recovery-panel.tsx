"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, RefreshCw, Zap } from "lucide-react"
import { DatabaseRecovery } from "@/lib/database-recovery"

export default function DatabaseRecoveryPanel() {
  const [diagnosing, setDiagnosing] = useState(false)
  const [recovering, setRecovering] = useState(false)
  const [result, setResult] = useState<any>(null)

  const runDiagnosis = async () => {
    setDiagnosing(true)
    setResult(null)

    try {
      const recovery = DatabaseRecovery.getInstance()
      const diagnosis = await recovery.diagnoseAndRecover()
      setResult(diagnosis)
    } catch (error) {
      setResult({
        success: false,
        issues: [`Diagnosis failed: ${error}`],
        fixes: ["Check console for detailed errors"],
        status: "Diagnosis error",
      })
    } finally {
      setDiagnosing(false)
    }
  }

  const emergencyReset = async () => {
    setRecovering(true)

    try {
      const recovery = DatabaseRecovery.getInstance()
      const success = await recovery.emergencyReset()

      if (success) {
        // Re-run diagnosis after reset
        await runDiagnosis()
      } else {
        setResult({
          success: false,
          issues: ["Emergency reset failed"],
          fixes: ["Check your Supabase project status"],
          status: "Reset failed",
        })
      }
    } catch (error) {
      console.error("Emergency reset error:", error)
    } finally {
      setRecovering(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-red-600 mb-2">🚨 Database Emergency Recovery</h1>
        <p className="text-gray-600">
          Your database is experiencing connectivity issues. Use this panel to diagnose and fix the problems.
        </p>
      </div>

      {/* Action Buttons */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Emergency Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button onClick={runDiagnosis} disabled={diagnosing} className="flex items-center gap-2">
              <RefreshCw className={`h-4 w-4 ${diagnosing ? "animate-spin" : ""}`} />
              {diagnosing ? "Diagnosing..." : "Run Diagnosis"}
            </Button>

            <Button
              onClick={emergencyReset}
              disabled={recovering}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <Zap className={`h-4 w-4 ${recovering ? "animate-pulse" : ""}`} />
              {recovering ? "Resetting..." : "Emergency Reset"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card className={`mb-6 ${result.success ? "border-green-200" : "border-red-200"}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              )}
              Diagnosis Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Badge variant={result.success ? "default" : "destructive"}>{result.status}</Badge>
            </div>

            {result.issues.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-red-600 mb-2">Issues Found:</h3>
                <ul className="list-disc list-inside space-y-1">
                  {result.issues.map((issue: string, index: number) => (
                    <li key={index} className="text-sm text-red-700">
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.fixes.length > 0 && (
              <div>
                <h3 className="font-semibold text-blue-600 mb-2">Recommended Fixes:</h3>
                <ul className="list-disc list-inside space-y-1">
                  {result.fixes.map((fix: string, index: number) => (
                    <li key={index} className="text-sm text-blue-700">
                      {fix}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Fixes */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Fix Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <span className="font-medium">1.</span>
              <div>
                <strong>Check Environment Variables:</strong>
                <p>Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="font-medium">2.</span>
              <div>
                <strong>Verify Supabase Project:</strong>
                <p>Check if your Supabase project is active and not paused</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="font-medium">3.</span>
              <div>
                <strong>Run Database Scripts:</strong>
                <p>Execute the setup scripts to create missing tables</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="font-medium">4.</span>
              <div>
                <strong>Check RLS Policies:</strong>
                <p>Ensure Row Level Security policies allow your operations</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="font-medium">5.</span>
              <div>
                <strong>Restart Development Server:</strong>
                <p>After fixing environment variables, restart with: npm run dev</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
