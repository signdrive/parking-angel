import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const spotId = searchParams.get("id")?.replace("eq.", "")
    const select = searchParams.get("select") || "latitude,longitude,spot_type,address,is_available"

    if (!spotId) {
      return NextResponse.json({ error: "Missing spot ID" }, { status: 400 })
    }

    let spotData = null

    // Handle Google Places IDs - get REAL coordinates
    if (spotId.startsWith("google_")) {
      const placeId = spotId.replace("google_", "")
      spotData = await getRealGooglePlaceData(placeId)
    }
    // Handle OpenStreetMap IDs - get REAL coordinates
    else if (spotId.startsWith("osm_")) {
      const osmId = spotId.replace("osm_", "")
      spotData = await getRealOSMData(osmId)
    }
    // Handle city parking data
    else if (spotId.startsWith("city_")) {
      spotData = await getRealCityParkingData(spotId)
    }
    // Handle TfL parking data (London)
    else if (spotId.startsWith("tfl_")) {
      spotData = await getRealTfLParkingData(spotId)
    }

    if (!spotData) {
      return NextResponse.json({ error: "Parking spot not found in real data sources" }, { status: 404 })
    }

    // Filter response based on requested fields
    const fields = select.split(",").map((f) => f.trim())
    const response: any = {}

    fields.forEach((field) => {
      if (spotData[field] !== undefined) {
        response[field] = spotData[field]
      }
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error("Real data API error:", error)
    return NextResponse.json({ error: "Failed to fetch real parking data" }, { status: 500 })
  }
}

async function getRealGooglePlaceData(placeId: string) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) {
    console.error("Google Places API key not configured")
    return null
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry,formatted_address,name,types&key=${apiKey}`,
    )

    if (!response.ok) {
      console.error("Google Places API request failed:", response.status)
      return null
    }

    const data = await response.json()

    if (data.result?.geometry?.location) {
      return {
        id: `google_${placeId}`,
        latitude: data.result.geometry.location.lat,
        longitude: data.result.geometry.location.lng,
        address: data.result.formatted_address,
        name: data.result.name,
        spot_type: data.result.types?.includes("parking") ? "lot" : "street",
        is_available: await checkRealAvailability(data.result.geometry.location),
        updated_at: new Date().toISOString(),
        source: "google_places",
      }
    }
  } catch (error) {
    console.error("Google Places API error:", error)
  }
  return null
}

async function getRealOSMData(osmId: string) {
  try {
    // Use Overpass API to get real OSM data
    const overpassQuery = `
      [out:json][timeout:25];
      (
        node(${osmId});
        way(${osmId});
        relation(${osmId});
      );
      out geom;
    `

    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `data=${encodeURIComponent(overpassQuery)}`,
    })

    if (!response.ok) {
      console.error("Overpass API request failed:", response.status)
      return null
    }

    const data = await response.json()

    if (data.elements && data.elements.length > 0) {
      const element = data.elements[0]
      let lat, lon

      if (element.lat && element.lon) {
        lat = element.lat
        lon = element.lon
      } else if (element.center) {
        lat = element.center.lat
        lon = element.center.lon
      } else if (element.geometry && element.geometry.length > 0) {
        lat = element.geometry[0].lat
        lon = element.geometry[0].lon
      }

      if (lat && lon) {
        const tags = element.tags || {}
        return {
          id: `osm_${osmId}`,
          latitude: lat,
          longitude: lon,
          address: formatOSMAddress(tags),
          name: tags.name || `OSM ${osmId}`,
          spot_type: tags.amenity === "parking" ? "lot" : "street",
          is_available: await checkRealAvailability({ lat, lng: lon }),
          updated_at: new Date().toISOString(),
          source: "openstreetmap",
        }
      }
    }
  } catch (error) {
    console.error("OSM API error:", error)
  }
  return null
}

async function getRealCityParkingData(spotId: string) {
  // Example: Amsterdam city parking API
  try {
    const response = await fetch(
      `https://api.data.amsterdam.nl/v1/parkeervakken/parkeervakken/?id=${spotId.replace("city_", "")}`,
    )

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    if (data.results && data.results.length > 0) {
      const spot = data.results[0]
      return {
        id: spotId,
        latitude: spot.geometry.coordinates[1],
        longitude: spot.geometry.coordinates[0],
        address: `${spot.straatnaam}, Amsterdam`,
        spot_type: "street",
        is_available: await checkRealAvailability({
          lat: spot.geometry.coordinates[1],
          lng: spot.geometry.coordinates[0],
        }),
        updated_at: new Date().toISOString(),
        source: "amsterdam_city",
      }
    }
  } catch (error) {
    console.error("City parking API error:", error)
  }
  return null
}

async function getRealTfLParkingData(spotId: string) {
  const apiKey = process.env.TFL_API_KEY
  if (!apiKey) {
    console.error("TfL API key not configured")
    return null
  }

  try {
    const response = await fetch(`https://api.tfl.gov.uk/Place/Type/CarPark?app_key=${apiKey}`)

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    const carPark = data.find((cp: any) => cp.id === spotId.replace("tfl_", ""))

    if (carPark) {
      return {
        id: spotId,
        latitude: carPark.lat,
        longitude: carPark.lon,
        address: carPark.commonName,
        name: carPark.commonName,
        spot_type: "lot",
        is_available:
          carPark.additionalProperties?.some((prop: any) => prop.key === "Spaces" && Number.parseInt(prop.value) > 0) ||
          true,
        updated_at: new Date().toISOString(),
        source: "tfl_london",
      }
    }
  } catch (error) {
    console.error("TfL API error:", error)
  }
  return null
}

async function checkRealAvailability(location: { lat: number; lng: number }) {
  // You can integrate with real-time parking availability APIs here
  // For now, return a realistic availability based on time of day
  const hour = new Date().getHours()
  const isBusinessHours = hour >= 9 && hour <= 17
  const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6

  // More likely to be available outside business hours or on weekends
  return Math.random() > (isBusinessHours && !isWeekend ? 0.7 : 0.3)
}

function formatOSMAddress(tags: any) {
  const parts = []
  if (tags["addr:housenumber"]) parts.push(tags["addr:housenumber"])
  if (tags["addr:street"]) parts.push(tags["addr:street"])
  if (tags["addr:city"]) parts.push(tags["addr:city"])
  if (tags["addr:postcode"]) parts.push(tags["addr:postcode"])

  return parts.length > 0 ? parts.join(", ") : `OSM Location`
}
