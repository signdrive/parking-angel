import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { message, context, location } = await request.json()

    console.log("Grok API Request:", { message, context, location })
    console.log("XAI_API_KEY available:", !!process.env.XAI_API_KEY)

    if (!process.env.XAI_API_KEY) {
      console.error("XAI_API_KEY not configured")
      return getIntelligentFallback(message)
    }

    // Enhanced prompt for parking assistance
    const systemPrompt = `You are a helpful parking assistant AI powered by Grok. You help users find parking spots, provide pricing information, estimate availability, and give navigation advice. 

Context: ${context || "general_parking_assistance"}
User Location: ${location || "unknown"}

Be concise, helpful, and friendly. Focus on practical parking advice. If you don't have specific real-time data, provide general guidance and suggest checking current conditions.`

    console.log("Making request to Grok API...")

    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.XAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "grok-beta",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: message,
          },
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    })

    console.log("Grok API Response Status:", response.status)

    if (!response.ok) {
      const errorData = await response.text()
      console.error("Grok API error:", errorData)
      return getIntelligentFallback(message)
    }

    const data = await response.json()
    console.log("Grok API Success:", data)

    const aiResponse = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't process that request."

    return NextResponse.json({
      response: aiResponse,
      model: "grok-beta",
      timestamp: new Date().toISOString(),
      success: true,
    })
  } catch (error) {
    console.error("Error in Grok chat API:", error)
    const message = "Error processing request" // Declare message variable here
    return getIntelligentFallback(message)
  }
}

function getIntelligentFallback(message: string): NextResponse {
  const lowerMessage = message.toLowerCase()

  let response = ""

  if (lowerMessage.includes("parking near") || lowerMessage.includes("nearby parking")) {
    response = `🅿️ **Finding Nearby Parking:**

• **Street Parking**: Check for metered spots within 2-3 blocks
• **Parking Garages**: Look for covered options with hourly rates
• **Shopping Centers**: Often have free parking with purchase
• **Apps to Try**: ParkWhiz, SpotHero, or local parking apps

💡 **Tip**: Arrive 10-15 minutes early to account for parking search time!`
  } else if (lowerMessage.includes("price") || lowerMessage.includes("cost") || lowerMessage.includes("cheap")) {
    response = `💰 **Parking Pricing Guide:**

• **Street Meters**: Usually $1-3/hour
• **Parking Garages**: $5-15/hour, daily rates $15-30
• **Premium Locations**: $10-25/hour in busy areas
• **Free Options**: Some malls, restaurants (with validation)

💡 **Money-Saving Tips**: Look for early bird specials, weekend rates, or validation deals!`
  } else if (
    lowerMessage.includes("navigation") ||
    lowerMessage.includes("directions") ||
    lowerMessage.includes("route")
  ) {
    response = `🗺️ **Navigation & Parking:**

• **Plan Ahead**: Check parking before you leave
• **Alternative Routes**: Avoid busy areas during peak hours
• **Backup Options**: Have 2-3 parking spots in mind
• **Walking Distance**: Consider spots 2-3 blocks away

💡 **Pro Tip**: Use Google Maps to check real-time parking availability!`
  } else if (lowerMessage.includes("time") || lowerMessage.includes("when") || lowerMessage.includes("busy")) {
    response = `⏰ **Best Parking Times:**

• **Avoid Rush Hours**: 7-9 AM, 5-7 PM on weekdays
• **Best Times**: Mid-morning (10 AM-12 PM) or mid-afternoon (2-4 PM)
• **Weekend Peak**: Saturday 12-6 PM is busiest
• **Early Bird**: Arrive before 8 AM for best selection

💡 **Smart Timing**: Leave 15 minutes earlier to reduce parking stress!`
  } else if (lowerMessage.includes("covered") || lowerMessage.includes("garage") || lowerMessage.includes("indoor")) {
    response = `🏢 **Covered Parking Options:**

• **Multi-level Garages**: Most secure, weather-protected
• **Underground Parking**: Usually in downtown areas
• **Shopping Mall Garages**: Often free with validation
• **Hotel Parking**: Sometimes available for non-guests

💡 **Benefits**: Protection from weather, better security, easier to find your car!`
  } else {
    response = `🤖 **I'm here to help with parking!**

**Ask me about:**
• "Find parking near [location]"
• "What are parking prices like?"
• "Best time to find parking"
• "Covered parking options"
• "Navigation to parking"

💡 **Quick Tips**: 
- Plan ahead for busy areas
- Consider walking 2-3 blocks for better rates
- Check apps like ParkWhiz or SpotHero
- Look for validation deals at restaurants/shops`
  }

  return NextResponse.json({
    response,
    model: "intelligent-fallback",
    timestamp: new Date().toISOString(),
    fallback: true,
    success: true,
  })
}
