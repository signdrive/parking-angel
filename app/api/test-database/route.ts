import { NextResponse } from "next/server"
import { getServerClient } from "@/lib/supabase/server-utils"
import { verifyUser } from "@/lib/server-auth"
import { APIError, handleAPIError } from "@/lib/api-error"

export async function GET() {
  try {
    // Only allow admins to run database tests
    await verifyUser("admin")
    const supabase = await getServerClient()
    const testResults = []

    // Test profiles table access
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id")
      .limit(1)

    testResults.push({
      test: "Profiles table",
      success: !profilesError,
      error: profilesError?.message,
    })

    // Test parking spots table
    const { data: spots, error: spotsError } = await supabase
      .from("parking_spots")
      .select("id")
      .limit(1)

    testResults.push({
      test: "Parking spots table",
      success: !spotsError,
      error: spotsError?.message,
    })

    // Test notifications table
    const { data: notifications, error: notificationsError } = await supabase
      .from("notifications")
      .select("id")
      .limit(1)

    testResults.push({
      test: "Notifications table",
      success: !notificationsError,
      error: notificationsError?.message,
    })

    // Test RPC functions
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      "find_nearby_real_spots",
      {
        lat: 51.5074,
        lng: -0.1278,
        radius: 1000,
      },
    )

    testResults.push({
      test: "RPC functions",
      success: !rpcError,
      error: rpcError?.message,
    })

    const failedTests = testResults.filter((test) => !test.success)

    if (failedTests.length > 0) {
      const errors = failedTests
        .map((test) => `${test.test}: ${test.error}`)
        .join("; ")
      throw new APIError(
        `Database tests failed: ${errors}`,
        500,
        "database_test_failed",
      )
    }

    return NextResponse.json({
      success: true,
      results: testResults,
      message: "All database tests passed",
    })
  } catch (error) {
    return handleAPIError(error)
  }
}
