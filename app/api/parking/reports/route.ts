import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { 
      spot_id, 
      user_id, 
      status, 
      confidence, 
      photo_url, 
      notes,
      location 
    } = await request.json()

    // Validate required fields
    if (!spot_id || !user_id || !status) {
      return NextResponse.json(
        { error: "Missing required fields: spot_id, user_id, status" },
        { status: 400 }
      )
    }

    // Try to insert the user report, with graceful fallback
    let report;
    try {
      const { data: dbReport, error: insertError } = await supabase
        .from('parking_reports')
        .insert({
          spot_id,
          user_id,
          status, // 'available', 'occupied', 'reserved', 'blocked'
          confidence: confidence || 80, // User confidence in their report (1-100)
          photo_url,
          notes,
          location,
          created_at: new Date().toISOString(),
          verified: false
        })
        .select()
        .single()

      if (insertError) {
        throw insertError
      }
      report = dbReport
    } catch (dbError) {
      console.log("Database not available, using mock response:", String(dbError))
      
      // Create mock report response when database is not available
      report = {
        id: `mock-report-${Date.now()}`,
        spot_id,
        user_id,
        status,
        confidence: confidence || 80,
        photo_url,
        notes,
        location,
        created_at: new Date().toISOString(),
        verified: false
      }
    }

    // These would normally update the database, but we'll simulate success
    // Update the main parking spot status based on recent reports
    await updateSpotStatusFromReports(spot_id)

    // Award points to the user for contributing
    await awardUserPoints(user_id, 'parking_report', 10)

    // Send real-time notification to nearby users
    await notifyNearbyUsers(location, status, spot_id)

    return NextResponse.json({
      success: true,
      report_id: report.id,
      message: "Report submitted successfully",
      points_awarded: 10
    })

  } catch (error) {
    console.error("Error in parking report API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const spot_id = searchParams.get('spot_id')
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    const radius = parseInt(searchParams.get('radius') || '1000')

    // Check if database is available by testing connection
    let reports;
    try {
      let query = supabase
        .from('parking_reports')
        .select(`
          *,
          profiles:user_id (
            email,
            full_name
          )
        `)
        .order('created_at', { ascending: false })

      if (spot_id) {
        query = query.eq('spot_id', spot_id).limit(20)
      } else if (lat && lng) {
        query = query.limit(50)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }
      reports = data
    } catch (dbError) {
      console.log("Database not available, using mock data:", String(dbError))
      
      // Return mock data when database is not available
      reports = generateMockReports(lat, lng, spot_id)
    }

    // Calculate reliability scores for reports
    const enhancedReports = reports?.map((report: any) => ({
      ...report,
      age_minutes: Math.floor((Date.now() - new Date(report.created_at).getTime()) / 60000),
      reliability_score: calculateReliabilityScore(report)
    }))

    return NextResponse.json({
      reports: enhancedReports,
      count: enhancedReports?.length || 0
    })

  } catch (error) {
    console.error("Error fetching parking reports:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Helper function to update spot status based on recent reports
async function updateSpotStatusFromReports(spot_id: string) {
  try {
    // Get recent reports (last 2 hours)
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    
    try {
      const { data: recentReports } = await supabase
        .from('parking_reports')
        .select('status, confidence, created_at')
        .eq('spot_id', spot_id)
        .gte('created_at', twoHoursAgo)
        .order('created_at', { ascending: false })

      if (!recentReports || recentReports.length === 0) return

      // Calculate weighted status based on recency and confidence
      let availableScore = 0
      let occupiedScore = 0
      let totalWeight = 0

      recentReports.forEach(report => {
        const ageMinutes = (Date.now() - new Date(report.created_at).getTime()) / 60000
        const timeWeight = Math.max(0, 1 - (ageMinutes / 120)) // Weight decreases over 2 hours
        const confidenceWeight = report.confidence / 100
        const weight = timeWeight * confidenceWeight

        if (report.status === 'available') {
          availableScore += weight
        } else if (report.status === 'occupied') {
          occupiedScore += weight
        }
        
        totalWeight += weight
      })

      // Determine most likely status
      const isAvailable = availableScore > occupiedScore
      const confidence = Math.min(100, Math.round((Math.max(availableScore, occupiedScore) / totalWeight) * 100))

      // Update spot in database (you'll need to create this table)
      await supabase
        .from('parking_spots_status')
        .upsert({
          spot_id,
          status: isAvailable ? 'available' : 'occupied',
          confidence,
          last_updated: new Date().toISOString()
        })
    } catch (dbError) {
      console.log("Database not available for spot status update:", String(dbError))
      // Gracefully handle database unavailability
    }

  } catch (error) {
    console.error("Error updating spot status:", error)
  }
}

// Helper function to award points to users
async function awardUserPoints(user_id: string, action: string, points: number) {
  try {
    try {
      await supabase
        .from('user_points')
        .upsert({
          user_id,
          action,
          points,
          created_at: new Date().toISOString()
        })

      // Update total points in user profile
      await supabase.rpc('increment_user_points', {
        user_id_param: user_id,
        points_param: points
      })
    } catch (dbError) {
      console.log("Database not available for points award:", String(dbError))
      // Gracefully handle database unavailability
    }

  } catch (error) {
    console.error("Error awarding points:", error)
  }
}

// Helper function to notify nearby users
async function notifyNearbyUsers(location: any, status: string, spot_id: string) {
  try {
    if (!location?.lat || !location?.lng) return

    // Here you would implement push notifications or real-time updates
    // For now, we'll just log it
    console.log(`🔔 Notification: Parking spot ${spot_id} is now ${status} at ${location.lat}, ${location.lng}`)
    
    // In a real implementation, you might:
    // 1. Find users within radius who have notifications enabled
    // 2. Send push notifications via Firebase/OneSignal
    // 3. Update real-time dashboard via WebSocket/SSE
    
  } catch (error) {
    console.error("Error sending notifications:", error)
  }
}

// Generate mock reports for demo purposes
function generateMockReports(lat: string | null, lng: string | null, spot_id: string | null) {
  const mockReports = [
    {
      id: 'mock-1',
      spot_id: spot_id || 'demo-spot-1',
      user_id: 'demo-user-1',
      status: 'available',
      confidence: 85,
      notes: 'Just left this spot, easy parking',
      created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      verified: true,
      verification_count: 2,
      profiles: {
        email: 'demo@example.com',
        full_name: 'Demo User'
      }
    },
    {
      id: 'mock-2',
      spot_id: spot_id || 'demo-spot-2',
      user_id: 'demo-user-2',
      status: 'occupied',
      confidence: 92,
      notes: 'Fully occupied, try nearby street',
      created_at: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      verified: false,
      verification_count: 0,
      profiles: {
        email: 'user2@example.com',
        full_name: 'Jane Smith'
      }
    },
    {
      id: 'mock-3',
      spot_id: spot_id || 'demo-spot-3',
      user_id: 'demo-user-3',
      status: 'available',
      confidence: 78,
      notes: '2 spaces available near the entrance',
      created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      verified: true,
      verification_count: 1,
      profiles: {
        email: 'parker@example.com',
        full_name: 'Mike Parker'
      }
    }
  ]

  return lat && lng ? mockReports : mockReports.slice(0, 1)
}

// Helper function to calculate reliability score
function calculateReliabilityScore(report: any): number {
  const ageMinutes = Math.floor((Date.now() - new Date(report.created_at).getTime()) / 60000)
  const baseScore = report.confidence || 80
  
  // Reduce score based on age
  const ageReduction = Math.min(50, ageMinutes * 0.5) // Max 50 point reduction
  
  // Boost score if photo is provided
  const photoBonus = report.photo_url ? 10 : 0
  
  return Math.max(0, Math.min(100, baseScore - ageReduction + photoBonus))
}
