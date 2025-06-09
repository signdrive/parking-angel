import { NextResponse } from "next/server"
import { DatabaseDiagnostics } from "@/lib/database-diagnostics"

export async function GET() {
  try {
    const diagnostics = DatabaseDiagnostics.getInstance()
    const results = await diagnostics.runComprehensiveDiagnostics()

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      status: results.issues.some((i) => i.severity === "critical") ? "critical" : "healthy",
      ...results,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: "Diagnostics failed",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
