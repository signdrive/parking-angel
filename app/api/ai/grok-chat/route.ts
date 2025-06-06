import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { message, context, location } = await request.json()

    if (!process.env.XAI_API_KEY) {
      throw new Error("XAI_API_KEY not configured")
    }

    // Enhanced prompt for parking assistance
    const systemPrompt = `You are a helpful parking assistant AI powered by Grok. You help users find parking spots, provide pricing information, estimate availability, and give navigation advice. 

Context: ${context || "general_parking_assistance"}
User Location: ${location || "unknown"}

Be concise, helpful, and friendly. Focus on practical parking advice. If you don't have specific real-time data, provide general guidance and suggest checking current conditions.`

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

    if (!response.ok) {
      const errorData = await response.text()
      console.error("Grok API error:", errorData)
      throw new Error(`Grok API error: ${response.status}`)
    }

    const data = await response.json()
    const aiResponse = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't process that request."

    return NextResponse.json({
      response: aiResponse,
      model: "grok-beta",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error in Grok chat API:", error)

    // Return a helpful fallback response
    return NextResponse.json(
      {
        response:
          "I'm having trouble connecting to my AI brain right now, but I can still help! Try asking about nearby parking, prices, or navigation.",
        error: true,
        fallback: true,
      },
      { status: 200 },
    )
  }
}
