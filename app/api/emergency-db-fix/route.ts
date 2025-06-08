import { NextResponse } from "next/server"
import { DatabaseRecovery } from "@/lib/database-recovery"

export async function POST() {
  try {
    console.log("🚨 Emergency database fix initiated...")

    const recovery = DatabaseRecovery.getInstance()

    // Run diagnosis
    const diagnosis = await recovery.diagnoseAndRecover()

    if (!diagnosis.success) {
      // Try emergency reset
      console.log("🔄 Attempting emergency reset...")
      const resetSuccess = await recovery.emergencyReset()

      if (resetSuccess) {
        // Re-run diagnosis
        const newDiagnosis = await recovery.diagnoseAndRecover()
        return NextResponse.json({
          success: newDiagnosis.success,
          message: "Emergency reset completed",
          diagnosis: newDiagnosis,
        })
      }
    }

    return NextResponse.json({
      success: diagnosis.success,
      message: diagnosis.success ? "Database is healthy" : "Issues found",
      diagnosis,
    })
  } catch (error) {
    console.error("Emergency fix failed:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Emergency fix failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
