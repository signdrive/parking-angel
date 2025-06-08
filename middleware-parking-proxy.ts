import { type NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  // Intercept Supabase parking_spots queries and redirect to our API
  if (request.url.includes("/rest/v1/parking_spots")) {
    const url = new URL(request.url)
    const spotId = url.searchParams.get("id")?.replace("eq.", "")
    const select = url.searchParams.get("select")

    if (spotId) {
      // Redirect to our universal API
      const newUrl = new URL("/api/parking/universal-spot", request.url)
      newUrl.searchParams.set("id", spotId)
      if (select) {
        newUrl.searchParams.set("select", select)
      }

      return NextResponse.redirect(newUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
