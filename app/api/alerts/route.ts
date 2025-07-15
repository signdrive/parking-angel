import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { 
      user_id, 
      alert_type, 
      location, 
      radius, 
      max_price, 
      vehicle_type, 
      notification_method,
      active_hours 
    } = await request.json()

    // Validate required fields
    if (!user_id || !alert_type || !location) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const alertId = `alert_${Date.now()}_${user_id}`

    // Create the alert configuration
    const alert = {
      id: alertId,
      user_id,
      alert_type, // 'spot_available', 'price_drop', 'leaving_soon', 'peak_time_reminder'
      location: {
        lat: location.lat,
        lng: location.lng,
        address: location.address || 'Unknown location'
      },
      radius: radius || 500, // meters
      max_price: max_price || null,
      vehicle_type: vehicle_type || 'car',
      notification_method: notification_method || 'push', // 'push', 'email', 'sms'
      active_hours: active_hours || { start: '00:00', end: '23:59' },
      created_at: new Date().toISOString(),
      is_active: true,
      triggered_count: 0
    }

    // Store alert in database (you'll need to create this table)
    // For now, we'll simulate success
    console.log("🔔 Smart Alert Created:", alert)

    // Start monitoring for this alert
    startAlertMonitoring(alert)

    return NextResponse.json({
      success: true,
      alert_id: alertId,
      message: "Smart alert created successfully",
      estimated_triggers_per_day: estimateTriggers(alert)
    })

  } catch (error) {
    console.error("Error creating smart alert:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get('user_id')
    
    if (!user_id) {
      return NextResponse.json(
        { error: "User ID required" },
        { status: 400 }
      )
    }

    // Mock user alerts (in real app, fetch from database)
    const userAlerts = [
      {
        id: "alert_1234_user1",
        alert_type: "spot_available",
        location: { lat: 51.5074, lng: -0.1278, address: "Central London" },
        radius: 300,
        max_price: 5.00,
        vehicle_type: "car",
        is_active: true,
        triggered_count: 12,
        last_triggered: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      }
    ]

    return NextResponse.json({
      alerts: userAlerts,
      total_active: userAlerts.filter(a => a.is_active).length
    })

  } catch (error) {
    console.error("Error fetching smart alerts:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const alert_id = searchParams.get('alert_id')
    
    if (!alert_id) {
      return NextResponse.json(
        { error: "Alert ID required" },
        { status: 400 }
      )
    }

    // Delete alert from database and stop monitoring
    console.log("🗑️ Deleting alert:", alert_id)

    return NextResponse.json({
      success: true,
      message: "Alert deleted successfully"
    })

  } catch (error) {
    console.error("Error deleting smart alert:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Alert monitoring functions
function startAlertMonitoring(alert: any) {
  // In a real implementation, this would set up:
  // 1. Periodic checks for parking availability
  // 2. Real-time monitoring of user reports
  // 3. Price change detection
  // 4. Traffic pattern analysis

  console.log(`🚨 Started monitoring alert: ${alert.id}`)
  
  // Simulate immediate check
  setTimeout(() => {
    checkAlertConditions(alert)
  }, 1000)
}

async function checkAlertConditions(alert: any) {
  try {
    switch (alert.alert_type) {
      case 'spot_available':
        await checkSpotAvailability(alert)
        break
      case 'price_drop':
        await checkPriceDrops(alert)
        break
      case 'leaving_soon':
        await checkLeavingSoon(alert)
        break
      case 'peak_time_reminder':
        await checkPeakTimeReminder(alert)
        break
    }
  } catch (error) {
    console.error("Error checking alert conditions:", error)
  }
}

async function checkSpotAvailability(alert: any) {
  // Check if any parking spots have become available in the user's area
  console.log(`🔍 Checking spot availability for alert ${alert.id}`)
  
  // Mock availability check
  const hasAvailableSpots = Math.random() > 0.7 // 30% chance of finding spots
  
  if (hasAvailableSpots) {
    await triggerAlert(alert, {
      title: "🅿️ Parking Spot Available!",
      message: `Found ${Math.floor(Math.random() * 3) + 1} available spots near ${alert.location.address}`,
      action_url: `/map?lat=${alert.location.lat}&lng=${alert.location.lng}&zoom=16`,
      priority: 'high'
    })
  }
}

async function checkPriceDrops(alert: any) {
  // Check for price reductions in parking spots
  console.log(`💰 Checking price drops for alert ${alert.id}`)
  
  const hasPriceDrop = Math.random() > 0.8 // 20% chance
  
  if (hasPriceDrop) {
    const oldPrice = 8.50
    const newPrice = 6.00
    
    await triggerAlert(alert, {
      title: "💰 Price Drop Alert!",
      message: `Parking price dropped from £${oldPrice} to £${newPrice} near ${alert.location.address}`,
      action_url: `/book?location=${encodeURIComponent(alert.location.address)}`,
      priority: 'medium'
    })
  }
}

async function checkLeavingSoon(alert: any) {
  // Detect when users are likely leaving parking spots
  console.log(`🚶 Checking for users leaving soon near alert ${alert.id}`)
  
  const someoneLeaving = Math.random() > 0.85 // 15% chance
  
  if (someoneLeaving) {
    await triggerAlert(alert, {
      title: "🚶 Someone's Leaving Soon!",
      message: `A user indicated they're leaving their parking spot in 10 minutes near ${alert.location.address}`,
      action_url: `/map?lat=${alert.location.lat}&lng=${alert.location.lng}&filter=leaving-soon`,
      priority: 'urgent'
    })
  }
}

async function checkPeakTimeReminder(alert: any) {
  const currentHour = new Date().getHours()
  const isPeakTime = (currentHour >= 7 && currentHour <= 9) || (currentHour >= 17 && currentHour <= 19)
  
  if (isPeakTime) {
    await triggerAlert(alert, {
      title: "⏰ Peak Time Reminder",
      message: `It's peak parking time! Consider booking in advance or using alternative transport.`,
      action_url: `/alternatives?location=${encodeURIComponent(alert.location.address)}`,
      priority: 'low'
    })
  }
}

async function triggerAlert(alert: any, notification: any) {
  try {
    console.log(`🔔 TRIGGERING ALERT:`, {
      alert_id: alert.id,
      user_id: alert.user_id,
      notification
    })

    // In a real implementation:
    // 1. Send push notification
    // 2. Send email if preferred
    // 3. Log to analytics
    // 4. Update trigger count
    
    // Mock different notification methods
    switch (alert.notification_method) {
      case 'push':
        await sendPushNotification(alert.user_id, notification)
        break
      case 'email':
        await sendEmailNotification(alert.user_id, notification)
        break
      case 'sms':
        await sendSMSNotification(alert.user_id, notification)
        break
    }

  } catch (error) {
    console.error("Error triggering alert:", error)
  }
}

async function sendPushNotification(user_id: string, notification: any) {
  console.log(`📱 Push notification sent to ${user_id}:`, notification.title)
  // Implement Firebase/OneSignal push notification
}

async function sendEmailNotification(user_id: string, notification: any) {
  console.log(`📧 Email sent to ${user_id}:`, notification.title)
  // Implement email notification (SendGrid, AWS SES, etc.)
}

async function sendSMSNotification(user_id: string, notification: any) {
  console.log(`📱 SMS sent to ${user_id}:`, notification.title)
  // Implement SMS notification (Twilio, AWS SNS, etc.)
}

function estimateTriggers(alert: any): number {
  // Estimate how many times per day this alert might trigger
  const baseRate = {
    'spot_available': 3,
    'price_drop': 1,
    'leaving_soon': 2,
    'peak_time_reminder': 2
  }
  
  const locationMultiplier = alert.radius > 1000 ? 1.5 : 1.0
  const priceMultiplier = alert.max_price && alert.max_price < 5 ? 0.7 : 1.0
  
  return Math.round((baseRate[alert.alert_type as keyof typeof baseRate] || 1) * locationMultiplier * priceMultiplier)
}
