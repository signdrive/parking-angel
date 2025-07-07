import { type NextRequest, NextResponse } from "next/server"
import { getClientUser } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { event, properties } = await request.json()

    if (!event) {
      return NextResponse.json({ error: "Missing event name" }, { status: 400 })
    }

    const { user } = await getClientUser();

    // Send event directly to GA4
    try {
      await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=G-XDLGR86H8Q&api_secret=${process.env.GA4_API_SECRET}`, {
        method: 'POST',
        body: JSON.stringify({
          client_id: user?.id || 'anonymous',
          events: [{
            name: event,
            params: {
              ...properties,
              user_id: user?.id
            }
          }]
        })
      });
    } catch (err) {
      console.error('GA4 event tracking failed:', err);
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to track analytics event" },
      { status: 500 }
    )
  }
}
