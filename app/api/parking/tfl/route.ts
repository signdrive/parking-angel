import { type NextRequest, NextResponse } from "next/server"

const TFL_BASE_URL = "https://api.tfl.gov.uk/Place"

export async function POST(request: NextRequest) {
  try {
    const { lat, lng, radius } = await request.json()
    const apiKey = process.env.TFL_API_KEY

    if (!apiKey) {
      console.log("TfL API key not configured")
      return NextResponse.json({ spots: [] })
    }

    // Use the geographic search endpoint to find car parks near the location
    const url = `${TFL_BASE_URL}?lat=${lat}&lon=${lng}&radius=${radius}&type=CarPark&app_key=${apiKey}`

    console.log("Fetching TfL data from:", url.replace(apiKey, "***"))

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      console.error("TfL API error:", response.status, response.statusText)
      return NextResponse.json({ spots: [] })
    }

    const data = await response.json()
    console.log("TfL API response:", data.length, "places found")

    // Transform TfL data to our parking spot format
    const spots = data
      .filter((place: any) => place.placeType === "CarPark")
      .map((place: any) => {
        // Extract additional properties
        const properties = place.additionalProperties || []
        const getProperty = (key: string) => {
          const prop = properties.find((p: any) => p.key === key)
          return prop ? prop.value : null
        }

        // Parse capacity
        const spacesStr = getProperty("Spaces") || getProperty("TotalSpaces") || getProperty("Capacity")
        const totalSpaces = spacesStr ? Number.parseInt(spacesStr) : undefined

        // Parse pricing
        const priceStr = getProperty("PricePerHour") || getProperty("HourlyRate") || getProperty("Cost")
        const pricePerHour = priceStr ? Number.parseFloat(priceStr) : undefined

        // Parse opening hours
        const openingHours = getProperty("OpeningHours") || getProperty("Hours")

        // Parse accessibility
        const accessibility =
          getProperty("DisabledAccess") === "true" ||
          getProperty("WheelchairAccess") === "true" ||
          getProperty("Accessible") === "true"

        // Parse security
        const security =
          getProperty("Security") === "true" || getProperty("CCTV") === "true" || getProperty("Staffed") === "true"

        // Parse covered status
        const covered =
          getProperty("Covered") === "true" ||
          getProperty("Indoor") === "true" ||
          place.commonName?.toLowerCase().includes("multi-storey") ||
          place.commonName?.toLowerCase().includes("underground")

        return {
          id: `tfl_${place.id}`,
          name: place.commonName || "TfL Car Park",
          latitude: place.lat,
          longitude: place.lon,
          address: buildTfLAddress(place, properties),
          spot_type: determineSpotType(place, properties),
          is_available: true, // TfL doesn't provide real-time availability
          total_spaces: totalSpaces,
          available_spaces: undefined, // No real-time data
          price_per_hour: pricePerHour,
          restrictions: extractRestrictions(properties),
          payment_methods: extractPaymentMethods(properties),
          accessibility,
          covered,
          security,
          ev_charging: getProperty("EVCharging") === "true" || getProperty("ElectricCharging") === "true",
          provider: "tfl",
          provider_id: place.id,
          real_time_data: false,
          last_updated: new Date(),
          opening_hours: parseOpeningHours(openingHours),
          contact_info: extractContactInfo(properties),
          distance: place.distance || 0,
        }
      })

    console.log("Transformed TfL spots:", spots.length)
    return NextResponse.json({ spots })
  } catch (error) {
    console.error("TfL API error:", error)
    return NextResponse.json({ spots: [] })
  }
}

function buildTfLAddress(place: any, properties: any[]): string {
  const getProperty = (key: string) => {
    const prop = properties.find((p: any) => p.key === key)
    return prop ? prop.value : null
  }

  const addressParts = []

  // Try to get address from properties
  const address = getProperty("Address") || getProperty("Location") || getProperty("Street")
  if (address) {
    addressParts.push(address)
  }

  const postcode = getProperty("Postcode") || getProperty("PostCode")
  if (postcode) {
    addressParts.push(postcode)
  }

  // If no address found, use the place name and add London
  if (addressParts.length === 0) {
    return `${place.commonName}, London, UK`
  }

  return `${addressParts.join(", ")}, London, UK`
}

function determineSpotType(place: any, properties: any[]): "street" | "garage" | "lot" | "meter" | "private" {
  const name = place.commonName?.toLowerCase() || ""
  const getProperty = (key: string) => {
    const prop = properties.find((p: any) => p.key === key)
    return prop ? prop.value?.toLowerCase() : null
  }

  const type = getProperty("Type") || getProperty("ParkingType") || ""

  if (name.includes("multi-storey") || name.includes("underground") || type.includes("garage")) {
    return "garage"
  }

  if (name.includes("surface") || type.includes("surface") || type.includes("lot")) {
    return "lot"
  }

  if (name.includes("street") || type.includes("street")) {
    return "street"
  }

  if (name.includes("private") || type.includes("private")) {
    return "private"
  }

  // Default to garage for TfL car parks
  return "garage"
}

function extractRestrictions(properties: any[]): string[] {
  const restrictions = []
  const getProperty = (key: string) => {
    const prop = properties.find((p: any) => p.key === key)
    return prop ? prop.value : null
  }

  const maxStay = getProperty("MaxStay") || getProperty("TimeLimit")
  if (maxStay) {
    restrictions.push(`Max stay: ${maxStay}`)
  }

  const heightRestriction = getProperty("HeightRestriction") || getProperty("MaxHeight")
  if (heightRestriction) {
    restrictions.push(`Height limit: ${heightRestriction}`)
  }

  const access = getProperty("Access") || getProperty("AccessRestrictions")
  if (access && access.toLowerCase() !== "public") {
    restrictions.push(`Access: ${access}`)
  }

  const permit = getProperty("PermitRequired") || getProperty("Permit")
  if (permit === "true" || permit === "yes") {
    restrictions.push("Permit required")
  }

  return restrictions
}

function extractPaymentMethods(properties: any[]): string[] {
  const methods = []
  const getProperty = (key: string) => {
    const prop = properties.find((p: any) => p.key === key)
    return prop ? prop.value?.toLowerCase() : null
  }

  const payment = getProperty("PaymentMethods") || getProperty("Payment") || ""

  if (payment.includes("card") || payment.includes("credit")) {
    methods.push("Credit Card")
  }
  if (payment.includes("cash")) {
    methods.push("Cash")
  }
  if (payment.includes("contactless")) {
    methods.push("Contactless")
  }
  if (payment.includes("oyster")) {
    methods.push("Oyster Card")
  }
  if (payment.includes("app") || payment.includes("mobile")) {
    methods.push("Mobile App")
  }

  return methods.length > 0 ? methods : ["Card", "Cash"] // Default assumption
}

function parseOpeningHours(hours: string | null): any {
  if (!hours) return undefined

  // Simple parsing - in production, use a proper opening hours parser
  return {
    note: hours,
    // Could add more sophisticated parsing here
  }
}

function extractContactInfo(properties: any[]): any {
  const getProperty = (key: string) => {
    const prop = properties.find((p: any) => p.key === key)
    return prop ? prop.value : null
  }

  const contact: any = {}

  const phone = getProperty("Phone") || getProperty("Telephone") || getProperty("Contact")
  if (phone) contact.phone = phone

  const website = getProperty("Website") || getProperty("URL") || getProperty("Web")
  if (website) contact.website = website

  const email = getProperty("Email") || getProperty("EmailAddress")
  if (email) contact.email = email

  return Object.keys(contact).length > 0 ? contact : undefined
}

// Also create an endpoint to get all TfL car parks (useful for initial data loading)
export async function GET() {
  try {
    const apiKey = process.env.TFL_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "TfL API key not configured" }, { status: 500 })
    }

    // Get all car parks in London
    const url = `${TFL_BASE_URL}/Type/CarPark?app_key=${apiKey}`

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`TfL API error: ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json({
      total: data.length,
      carParks: data.slice(0, 10), // Return first 10 for preview
      message: "TfL API connection successful",
    })
  } catch (error) {
    console.error("TfL API test error:", error)
    return NextResponse.json({ error: "Failed to connect to TfL API" }, { status: 500 })
  }
}
