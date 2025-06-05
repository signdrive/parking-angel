import { type NextRequest, NextResponse } from "next/server"

// City-specific parking APIs
const CITY_APIS = {
  // San Francisco
  SF: {
    name: "San Francisco",
    bounds: { north: 37.8324, south: 37.7049, east: -122.3482, west: -122.5584 },
    api: "https://api.sfmta.com/v1/gtfs/stops",
  },
  // New York
  NYC: {
    name: "New York City",
    bounds: { north: 40.9176, south: 40.4774, east: -73.7004, west: -74.2591 },
    api: "https://data.cityofnewyork.us/resource/pvqr-7yc4.json",
  },
  // London
  LONDON: {
    name: "London",
    bounds: { north: 51.6723, south: 51.2867, east: 0.334, west: -0.5103 },
    api: "https://api.tfl.gov.uk/Place/Type/CarPark",
  },
  // Paris
  PARIS: {
    name: "Paris",
    bounds: { north: 48.9021, south: 48.8155, east: 2.4699, west: 2.2241 },
    api: "https://opendata.paris.fr/api/records/1.0/search/?dataset=stationnement-voie-publique-emplacements",
  },
}

export async function POST(request: NextRequest) {
  try {
    const { lat, lng, radius } = await request.json()

    // Determine which city API to use based on coordinates
    const city = detectCity(lat, lng)
    if (!city) {
      return NextResponse.json({ spots: [] })
    }

    const spots = await fetchCityParkingData(city, lat, lng, radius)
    return NextResponse.json({ spots })
  } catch (error) {
    console.error("City API error:", error)
    return NextResponse.json({ spots: [] })
  }
}

function detectCity(lat: number, lng: number): any {
  for (const [key, city] of Object.entries(CITY_APIS)) {
    if (lat >= city.bounds.south && lat <= city.bounds.north && lng >= city.bounds.west && lng <= city.bounds.east) {
      return { key, ...city }
    }
  }
  return null
}

async function fetchCityParkingData(city: any, lat: number, lng: number, radius: number) {
  try {
    switch (city.key) {
      case "SF":
        return await fetchSFParkingData(lat, lng, radius)
      case "NYC":
        return await fetchNYCParkingData(lat, lng, radius)
      case "LONDON":
        return await fetchLondonParkingData(lat, lng, radius)
      case "PARIS":
        return await fetchParisParkingData(lat, lng, radius)
      default:
        return []
    }
  } catch (error) {
    console.error(`Error fetching ${city.name} parking data:`, error)
    return []
  }
}

async function fetchSFParkingData(lat: number, lng: number, radius: number) {
  // San Francisco parking meter data
  const response = await fetch(
    `https://data.sfgov.org/resource/imvp-dq3v.json?$where=within_circle(location,${lat},${lng},${radius})`,
  )

  if (!response.ok) return []

  const data = await response.json()
  return data.map((meter: any) => ({
    id: `sf_${meter.post_id}`,
    name: `Parking Meter ${meter.post_id}`,
    latitude: Number.parseFloat(meter.location?.latitude || lat),
    longitude: Number.parseFloat(meter.location?.longitude || lng),
    address: `${meter.street_name}, San Francisco, CA`,
    spot_type: "meter",
    is_available: true,
    price_per_hour: 4.0, // SF average
    max_duration_hours: 2,
    provider: "city_api",
    provider_id: meter.post_id,
    real_time_data: false,
    last_updated: new Date(),
  }))
}

async function fetchNYCParkingData(lat: number, lng: number, radius: number) {
  // NYC parking regulations data
  const response = await fetch(
    `https://data.cityofnewyork.us/resource/pvqr-7yc4.json?$where=within_circle(the_geom,${lat},${lng},${radius})`,
  )

  if (!response.ok) return []

  const data = await response.json()
  return data.slice(0, 50).map((spot: any, index: number) => ({
    id: `nyc_${index}`,
    name: `NYC Parking Zone`,
    latitude: lat + (Math.random() - 0.5) * 0.01,
    longitude: lng + (Math.random() - 0.5) * 0.01,
    address: `${spot.street_name || "Street"}, New York, NY`,
    spot_type: "street",
    is_available: true,
    price_per_hour: 3.0,
    restrictions: [spot.regulation_description].filter(Boolean),
    provider: "city_api",
    provider_id: `nyc_${index}`,
    real_time_data: false,
    last_updated: new Date(),
  }))
}

async function fetchLondonParkingData(lat: number, lng: number, radius: number) {
  // London TfL parking data
  const response = await fetch(
    `https://api.tfl.gov.uk/Place/Type/CarPark?lat=${lat}&lon=${lng}&radius=${radius}&app_key=${process.env.TFL_API_KEY}`,
  )

  if (!response.ok) return []

  const data = await response.json()
  return data.slice(0, 20).map((carPark: any) => ({
    id: `london_${carPark.id}`,
    name: carPark.commonName,
    latitude: carPark.lat,
    longitude: carPark.lon,
    address: carPark.place?.address?.streetAddress || "London, UK",
    spot_type: "garage",
    is_available: true,
    total_spaces: carPark.additionalProperties?.find((p: any) => p.key === "Spaces")?.value,
    provider: "city_api",
    provider_id: carPark.id,
    real_time_data: false,
    last_updated: new Date(),
  }))
}

async function fetchParisParkingData(lat: number, lng: number, radius: number) {
  // Paris open data parking
  const response = await fetch(
    `https://opendata.paris.fr/api/records/1.0/search/?dataset=stationnement-voie-publique-emplacements&geofilter.distance=${lat},${lng},${radius}`,
  )

  if (!response.ok) return []

  const data = await response.json()
  return (
    data.records?.slice(0, 30).map((record: any) => ({
      id: `paris_${record.recordid}`,
      name: "Paris Street Parking",
      latitude: record.geometry?.coordinates[1],
      longitude: record.geometry?.coordinates[0],
      address: `${record.fields?.adresse || "Paris"}, France`,
      spot_type: "street",
      is_available: true,
      price_per_hour: 2.4, // Paris average
      provider: "city_api",
      provider_id: record.recordid,
      real_time_data: false,
      last_updated: new Date(),
    })) || []
  )
}
