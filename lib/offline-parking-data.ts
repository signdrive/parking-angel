export const OFFLINE_PARKING_DATA = [
  // Brussels area
  {
    id: "offline_brussels_1",
    latitude: 50.8503,
    longitude: 4.3517,
    address: "Grand Place, Brussels",
    spot_type: "garage",
    is_available: true,
    provider: "offline_data",
    confidence_score: 85,
  },
  {
    id: "offline_brussels_2",
    latitude: 50.8476,
    longitude: 4.3572,
    address: "Rue de la Loi, Brussels",
    spot_type: "street",
    is_available: true,
    provider: "offline_data",
    confidence_score: 70,
  },
  // Bruges area
  {
    id: "offline_bruges_1",
    latitude: 51.2093,
    longitude: 3.2247,
    address: "Market Square, Bruges",
    spot_type: "garage",
    is_available: true,
    provider: "offline_data",
    confidence_score: 90,
  },
  {
    id: "offline_bruges_2",
    latitude: 51.2034,
    longitude: 3.2233,
    address: "'t Zand, Bruges",
    spot_type: "garage",
    is_available: true,
    provider: "offline_data",
    confidence_score: 85,
  },
  // Antwerp area
  {
    id: "offline_antwerp_1",
    latitude: 51.2194,
    longitude: 4.4025,
    address: "Grote Markt, Antwerp",
    spot_type: "garage",
    is_available: true,
    provider: "offline_data",
    confidence_score: 80,
  },
  // Ghent area
  {
    id: "offline_ghent_1",
    latitude: 51.0543,
    longitude: 3.7174,
    address: "Gravensteen, Ghent",
    spot_type: "street",
    is_available: true,
    provider: "offline_data",
    confidence_score: 75,
  },
  // London area (for testing)
  {
    id: "offline_london_1",
    latitude: 51.5074,
    longitude: -0.1278,
    address: "Westminster, London",
    spot_type: "garage",
    is_available: true,
    provider: "offline_data",
    confidence_score: 85,
  },
  {
    id: "offline_london_2",
    latitude: 51.5155,
    longitude: -0.0922,
    address: "Tower Bridge, London",
    spot_type: "street",
    is_available: true,
    provider: "offline_data",
    confidence_score: 70,
  },
]

export function getOfflineParkingSpots(lat: number, lng: number, radiusKm = 10) {
  return OFFLINE_PARKING_DATA.filter((spot) => {
    const distance = calculateDistance(lat, lng, spot.latitude, spot.longitude)
    return distance <= radiusKm
  })
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}
