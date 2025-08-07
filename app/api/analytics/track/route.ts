import { type NextRequest, NextResponse } from "next/server"
import { getClientUser } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { event, properties } = await request.json()

    if (!event) {
      return NextResponse.json({ error: "Missing event name" }, { status: 400 })
    }

    // Skip Google Analytics tracking in development
    if (process.env.NODE_ENV !== 'production') {
      console.log('Analytics event (dev mode):', { event, properties });
      return NextResponse.json({ success: true, dev_mode: true });
    }

    const { user } = await getClientUser();

    // Send event directly to GA4 only in production
    if (process.env.GA4_API_SECRET) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        
        await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=G-XDLGR86H8Q&api_secret=${process.env.GA4_API_SECRET}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            client_id: user?.id || 'anonymous',
            events: [{
              name: event,
              params: {
                ...properties,
                user_id: user?.id
              }
            }]
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeout);
      } catch (err) {
        console.error('GA4 event tracking failed:', err);
        // Don't fail the API call if GA4 fails
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to track analytics event" },
      { status: 500 }
    )
  }
}
