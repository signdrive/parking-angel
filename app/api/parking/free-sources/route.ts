import { type NextRequest, NextResponse } from "next/server"

// Free parking data sources
export async function POST(request: NextRequest) {
  try {
    const { lat, lng, radius } = await request.json()
    
    console.log(`🆓 Fetching free parking data for ${lat}, ${lng} within ${radius}m`)
    
    const allSpots: any[] = []
    
    // Fetch from multiple free sources in parallel
    const sources = await Promise.allSettled([
      fetchOpenStreetMapParking(lat, lng, radius),
      fetchParkAPIData(lat, lng, radius),
      fetchHEREFreeTier(lat, lng, radius),
      fetchNominatimParking(lat, lng, radius),
      fetchGovernmentOpenData(lat, lng, radius)
    ])
    
    sources.forEach((result, index) => {
      const sourceNames = ['OpenStreetMap', 'ParkAPI', 'HERE', 'Nominatim', 'Government']
      if (result.status === "fulfilled") {
        console.log(`✅ ${sourceNames[index]}: ${result.value.length} spots`)
        allSpots.push(...result.value)
      } else {
        console.log(`❌ ${sourceNames[index]} failed:`, result.reason?.message)
      }
    })
    
    // Remove duplicates based on coordinates
    const uniqueSpots = removeDuplicateSpots(allSpots)
    
    console.log(`🎯 Total unique spots found: ${uniqueSpots.length}`)
    
    return NextResponse.json({ spots: uniqueSpots })
  } catch (error) {
    console.error("Free sources API error:", error)
    return NextResponse.json({ spots: [] })
  }
}

// OpenStreetMap via Overpass API (completely free)
async function fetchOpenStreetMapParking(lat: number, lng: number, radius: number) {
  try {
    const query = `
      [out:json][timeout:25];
      (
        node["amenity"="parking"](around:${radius},${lat},${lng});
        way["amenity"="parking"](around:${radius},${lat},${lng});
        node["amenity"="parking_meter"](around:${radius},${lat},${lng});
        node["amenity"="parking_space"](around:${radius},${lat},${lng});
      );
      out center meta;
    `

    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: query,
      headers: {
        'Content-Type': 'text/plain'
      }
    })

    if (!response.ok) throw new Error(`OSM API error: ${response.status}`)
    
    const data = await response.json()
    
    return data.elements.map((element: any) => ({
      id: `osm_${element.id}`,
      name: element.tags?.name || `${element.tags?.amenity?.replace('_', ' ')} Spot`,
      latitude: element.lat || element.center?.lat,
      longitude: element.lon || element.center?.lon,
      address: buildOSMAddress(element.tags, lat, lng),
      spot_type: mapOSMParkingType(element.tags),
      is_available: true,
      total_spaces: element.tags?.capacity ? parseInt(element.tags.capacity) : undefined,
      price_per_hour: element.tags?.fee === "yes" ? undefined : 0,
      restrictions: parseOSMRestrictions(element.tags),
      accessibility: element.tags?.wheelchair === "yes",
      covered: element.tags?.covered === "yes",
      security: element.tags?.supervised === "yes",
      provider: "openstreetmap",
      provider_id: element.id.toString(),
      real_time_data: false,
      last_updated: new Date(),
      opening_hours: element.tags?.opening_hours
    }))
  } catch (error) {
    console.error("OSM fetch failed:", error)
    return []
  }
}

// ParkAPI for European cities (free)
async function fetchParkAPIData(lat: number, lng: number, radius: number) {
  try {
    // Check if location is in Europe (rough bounds)
    if (lat < 35 || lat > 70 || lng < -10 || lng > 50) {
      return [] // Not in Europe
    }
    
    const response = await fetch(`https://api.parkendd.de/cities`)
    if (!response.ok) return []
    
    const cities = await response.json()
    
    // Find nearest city
    const nearestCity = cities.find((city: any) => {
      const distance = getDistance(lat, lng, city.coords.lat, city.coords.lng)
      return distance < 50000 // Within 50km
    })
    
    if (!nearestCity) return []
    
    const parkingResponse = await fetch(`https://api.parkendd.de/${nearestCity.id}`)
    if (!parkingResponse.ok) return []
    
    const parkingData = await parkingResponse.json()
    
    return parkingData.lots?.map((lot: any) => ({
      id: `parkapi_${lot.id}`,
      name: lot.name,
      latitude: lot.coords.lat,
      longitude: lot.coords.lng,
      address: `${lot.address || lot.name}, ${nearestCity.name}`,
      spot_type: "lot",
      is_available: lot.state === "open",
      total_spaces: lot.total,
      available_spaces: lot.free,
      price_per_hour: undefined,
      provider: "parkapi",
      provider_id: lot.id,
      real_time_data: true,
      last_updated: new Date(lot.last_updated || new Date())
    })) || []
  } catch (error) {
    console.error("ParkAPI fetch failed:", error)
    return []
  }
}

// HERE API free tier (1000 requests/day)
async function fetchHEREFreeTier(lat: number, lng: number, radius: number) {
  try {
    const hereApiKey = process.env.HERE_API_KEY
    if (!hereApiKey) return []
    
    const response = await fetch(
      `https://discover.search.hereapi.com/v1/discover?at=${lat},${lng}&q=parking&limit=20&apikey=${hereApiKey}`
    )
    
    if (!response.ok) return []
    
    const data = await response.json()
    
    return data.items?.map((item: any) => ({
      id: `here_${item.id}`,
      name: item.title,
      latitude: item.position.lat,
      longitude: item.position.lng,
      address: item.address?.label || "Address not available",
      spot_type: "lot",
      is_available: true,
      provider: "here",
      provider_id: item.id,
      real_time_data: false,
      last_updated: new Date()
    })) || []
  } catch (error) {
    console.error("HERE API fetch failed:", error)
    return []
  }
}

// Nominatim for geocoding and POI search (free)
async function fetchNominatimParking(lat: number, lng: number, radius: number) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&amenity=parking&bounded=1&viewbox=${lng-0.01},${lat+0.01},${lng+0.01},${lat-0.01}&limit=50`,
      {
        headers: {
          'User-Agent': 'ParkingAngel/1.0'
        }
      }
    )
    
    if (!response.ok) return []
    
    const data = await response.json()
    
    return data.map((item: any) => ({
      id: `nominatim_${item.osm_id}`,
      name: item.display_name.split(',')[0] || "Parking Area",
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
      address: item.display_name,
      spot_type: "lot",
      is_available: true,
      provider: "nominatim",
      provider_id: item.osm_id,
      real_time_data: false,
      last_updated: new Date()
    }))
  } catch (error) {
    console.error("Nominatim fetch failed:", error)
    return []
  }
}

// Government open data APIs
async function fetchGovernmentOpenData(lat: number, lng: number, radius: number) {
  try {
    const spots: any[] = []
    
    // UK Government data
    if (lat > 50 && lat < 61 && lng > -8 && lng < 2) {
      // UK coordinates
      try {
        // Example: UK parking data (you'd need to find specific endpoints)
        // This is a placeholder - replace with actual UK government parking APIs
        console.log("UK location detected - would fetch UK government data")
      } catch (error) {
        console.error("UK government data fetch failed:", error)
      }
    }
    
    // Germany
    if (lat > 47 && lat < 55 && lng > 5 && lng < 16) {
      try {
        // German open data example
        console.log("German location detected - would fetch German government data")
      } catch (error) {
        console.error("German government data fetch failed:", error)
      }
    }
    
    return spots
  } catch (error) {
    console.error("Government data fetch failed:", error)
    return []
  }
}

// Utility functions
function buildOSMAddress(tags: any, fallbackLat: number, fallbackLng: number): string {
  const parts = []
  if (tags?.["addr:housenumber"]) parts.push(tags["addr:housenumber"])
  if (tags?.["addr:street"]) parts.push(tags["addr:street"])
  if (tags?.["addr:city"]) parts.push(tags["addr:city"])
  if (tags?.["addr:postcode"]) parts.push(tags["addr:postcode"])
  
  if (parts.length === 0) {
    return `Parking near ${fallbackLat.toFixed(4)}, ${fallbackLng.toFixed(4)}`
  }
  
  return parts.join(", ")
}

function mapOSMParkingType(tags: any): "street" | "garage" | "lot" | "meter" | "private" {
  if (tags?.amenity === "parking_meter") return "meter"
  if (tags?.parking === "street_side") return "street"
  if (tags?.parking === "underground" || tags?.parking === "multi-storey") return "garage"
  if (tags?.access === "private") return "private"
  return "lot"
}

function parseOSMRestrictions(tags: any): string[] {
  const restrictions = []
  if (tags?.maxstay) restrictions.push(`Max stay: ${tags.maxstay}`)
  if (tags?.fee === "yes") restrictions.push("Paid parking")
  if (tags?.access && tags.access !== "yes") restrictions.push(`Access: ${tags.access}`)
  return restrictions
}

function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = lat1 * Math.PI/180
  const φ2 = lat2 * Math.PI/180
  const Δφ = (lat2-lat1) * Math.PI/180
  const Δλ = (lng2-lng1) * Math.PI/180

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

  return R * c
}

function removeDuplicateSpots(spots: any[]): any[] {
  const seen = new Set()
  return spots.filter(spot => {
    const key = `${spot.latitude.toFixed(4)},${spot.longitude.toFixed(4)}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
