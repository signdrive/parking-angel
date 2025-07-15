import { type NextRequest, NextResponse } from "next/server"

// Vehicle specifications database
const VEHICLE_SPECS = {
  // Cars
  'small_car': { length: 4.0, width: 1.7, height: 1.5, type: 'car', name: 'Small Car (e.g. Mini, Fiat 500)' },
  'medium_car': { length: 4.5, width: 1.8, height: 1.5, type: 'car', name: 'Medium Car (e.g. Golf, Focus)' },
  'large_car': { length: 4.8, width: 1.9, height: 1.6, type: 'car', name: 'Large Car (e.g. BMW 5 Series)' },
  'luxury_car': { length: 5.1, width: 2.0, height: 1.5, type: 'car', name: 'Luxury Car (e.g. Mercedes S-Class)' },
  'suv_small': { length: 4.3, width: 1.8, height: 1.8, type: 'suv', name: 'Small SUV (e.g. Nissan Juke)' },
  'suv_medium': { length: 4.7, width: 1.9, height: 1.8, type: 'suv', name: 'Medium SUV (e.g. BMW X3)' },
  'suv_large': { length: 5.0, width: 2.0, height: 1.9, type: 'suv', name: 'Large SUV (e.g. Range Rover)' },
  
  // Electric vehicles
  'tesla_model_3': { length: 4.7, width: 1.9, height: 1.4, type: 'electric', name: 'Tesla Model 3', needs_charging: true },
  'tesla_model_s': { length: 5.0, width: 2.0, height: 1.4, type: 'electric', name: 'Tesla Model S', needs_charging: true },
  'nissan_leaf': { length: 4.5, width: 1.8, height: 1.5, type: 'electric', name: 'Nissan Leaf', needs_charging: true },
  'bmw_i3': { length: 4.0, width: 1.8, height: 1.6, type: 'electric', name: 'BMW i3', needs_charging: true },
  
  // Commercial vehicles
  'van_small': { length: 5.4, width: 2.0, height: 2.3, type: 'van', name: 'Small Van (e.g. Transit Connect)' },
  'van_medium': { length: 6.0, width: 2.0, height: 2.5, type: 'van', name: 'Medium Van (e.g. Transit)' },
  'van_large': { length: 6.9, width: 2.1, height: 2.6, type: 'van', name: 'Large Van (e.g. Sprinter)' },
  
  // Motorcycles
  'motorcycle': { length: 2.1, width: 0.8, height: 1.2, type: 'motorcycle', name: 'Motorcycle' },
  'scooter': { length: 1.9, width: 0.7, height: 1.1, type: 'motorcycle', name: 'Scooter' },
  
  // Trucks
  'pickup': { length: 5.8, width: 2.0, height: 1.9, type: 'truck', name: 'Pickup Truck' },
  'truck_small': { length: 8.0, width: 2.5, height: 3.5, type: 'truck', name: 'Small Truck (7.5T)' },
  'truck_large': { length: 12.0, width: 2.6, height: 4.0, type: 'truck', name: 'Large Truck (HGV)' }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'vehicle-types') {
      // Return available vehicle types
      const vehicleTypes = Object.entries(VEHICLE_SPECS).map(([key, spec]) => ({
        id: key,
        ...spec
      }))

      return NextResponse.json({
        vehicle_types: vehicleTypes,
        categories: {
          car: vehicleTypes.filter(v => v.type === 'car'),
          electric: vehicleTypes.filter(v => v.type === 'electric'),
          van: vehicleTypes.filter(v => v.type === 'van'),
          motorcycle: vehicleTypes.filter(v => v.type === 'motorcycle'),
          truck: vehicleTypes.filter(v => v.type === 'truck')
        }
      })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })

  } catch (error) {
    console.error("Error in vehicle-specific API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { 
      vehicle_id,
      location,
      radius,
      requirements,
      custom_dimensions 
    } = await request.json()

    // Get vehicle specifications
    let vehicleSpec = VEHICLE_SPECS[vehicle_id as keyof typeof VEHICLE_SPECS]
    
    if (!vehicleSpec && custom_dimensions) {
      vehicleSpec = {
        length: custom_dimensions.length,
        width: custom_dimensions.width,
        height: custom_dimensions.height,
        type: custom_dimensions.type || 'custom',
        name: 'Custom Vehicle'
      }
    }

    if (!vehicleSpec) {
      return NextResponse.json(
        { error: "Invalid vehicle type" },
        { status: 400 }
      )
    }

    // Find compatible parking spots
    const compatibleSpots = await findCompatibleSpots(vehicleSpec, location, radius, requirements)

    return NextResponse.json({
      vehicle: vehicleSpec,
      compatible_spots: compatibleSpots,
      total_found: compatibleSpots.length,
      search_criteria: {
        min_length: vehicleSpec.length + 0.5, // Add clearance
        min_width: vehicleSpec.width + 0.2,
        max_height: vehicleSpec.height + 0.5,
        special_requirements: requirements
      }
    })

  } catch (error) {
    console.error("Error finding vehicle-compatible spots:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

async function findCompatibleSpots(vehicleSpec: any, location: any, radius: number, requirements: any) {
  // In a real implementation, this would query your parking database
  // For now, we'll generate mock data with realistic constraints
  
  const mockSpots = []
  const spotCount = Math.floor(Math.random() * 15) + 8 // Ensure at least 8 spots

  for (let i = 0; i < spotCount; i++) {
    const spot = generateMockSpot(vehicleSpec, location, radius, requirements, i)
    if (spot) mockSpots.push(spot)
  }

  // If we have very few spots, generate some guaranteed compatible ones
  if (mockSpots.length < 3) {
    for (let i = mockSpots.length; i < 5; i++) {
      const guaranteedSpot = generateGuaranteedCompatibleSpot(vehicleSpec, location, radius, requirements, i)
      mockSpots.push(guaranteedSpot)
    }
  }

  return mockSpots.sort((a, b) => a.distance - b.distance)
}

function generateGuaranteedCompatibleSpot(vehicleSpec: any, location: any, radius: number, requirements: any, index: number) {
  // Generate a spot that's guaranteed to be compatible with the vehicle
  const angle = Math.random() * 2 * Math.PI
  const distance = Math.random() * radius
  const lat = location.lat + (distance * Math.cos(angle)) / 111000
  const lng = location.lng + (distance * Math.sin(angle)) / (111000 * Math.cos(location.lat * Math.PI / 180))

  // Ensure dimensions are always compatible
  const spotLength = vehicleSpec.length + 1.0 + Math.random() * 2 // Always bigger
  const spotWidth = vehicleSpec.width + 0.5 + Math.random() * 0.5 // Always bigger
  const spotHeight = vehicleSpec.height + 1.0 + Math.random() * 2 // Always bigger

  // Ensure special requirements are met
  const hasCharging = requirements?.needs_charging || Math.random() > 0.5
  const isAccessible = requirements?.needs_accessible || Math.random() > 0.7
  const allowsOvernight = requirements?.needs_overnight || Math.random() > 0.3
  const allowsCommercial = true // Always allow commercial for guaranteed spots
  const isCovered = Math.random() > 0.5

  // Calculate pricing
  let basePrice = 3 + Math.random() * 6 // £3-9 base
  if (vehicleSpec.type === 'van') basePrice *= 1.2
  if (vehicleSpec.type === 'truck') basePrice *= 1.8
  if (hasCharging) basePrice += 1.5
  if (isCovered) basePrice += 1

  return {
    id: `guaranteed_spot_${index}_${vehicleSpec.type}`,
    name: `${isCovered ? 'Premium Covered' : 'Open Access'} Parking ${index + 1}`,
    location: { lat, lng },
    distance: Math.round(distance),
    dimensions: {
      length: Math.round(spotLength * 10) / 10,
      width: Math.round(spotWidth * 10) / 10,
      height: isCovered ? Math.round(spotHeight * 10) / 10 : null
    },
    features: {
      covered: isCovered,
      ev_charging: hasCharging,
      accessible: isAccessible,
      overnight_allowed: allowsOvernight,
      commercial_allowed: allowsCommercial,
      surface_type: 'tarmac'
    },
    pricing: {
      hourly: Math.round(basePrice * 100) / 100,
      daily: Math.round(basePrice * 7.5 * 100) / 100,
      weekly: Math.round(basePrice * 7.5 * 5.5 * 100) / 100
    },
    availability: {
      available_now: true, // Guaranteed spots are always available
      next_available: null
    },
    compatibility_score: 95 + Math.random() * 5, // Very high compatibility
    restrictions: generateRestrictions(vehicleSpec)
  }
}

function generateMockSpot(vehicleSpec: any, location: any, radius: number, requirements: any, index: number) {
  // Generate random spot within radius
  const angle = Math.random() * 2 * Math.PI
  const distance = Math.random() * radius
  const lat = location.lat + (distance * Math.cos(angle)) / 111000
  const lng = location.lng + (distance * Math.sin(angle)) / (111000 * Math.cos(location.lat * Math.PI / 180))

  // Check if spot is compatible with vehicle
  const spotLength = 3.5 + Math.random() * 3 // 3.5m to 6.5m
  const spotWidth = 1.8 + Math.random() * 0.8 // 1.8m to 2.6m
  const spotHeight = 2.0 + Math.random() * 3 // 2.0m to 5.0m (for garages)

  const requiredLength = vehicleSpec.length + 0.5
  const requiredWidth = vehicleSpec.width + 0.2
  const maxHeight = vehicleSpec.height

  // Check basic dimensions
  if (spotLength < requiredLength || spotWidth < requiredWidth) {
    return null
  }

  // Check height for covered parking
  const isCovered = Math.random() > 0.7
  if (isCovered && spotHeight < maxHeight + 0.5) {
    return null
  }

  // Check special requirements
  const hasCharging = Math.random() > 0.8
  const isAccessible = Math.random() > 0.9
  const allowsOvernight = Math.random() > 0.6
  const allowsCommercial = vehicleSpec.type !== 'truck' || Math.random() > 0.7

  if (requirements?.needs_charging && !hasCharging) return null
  if (requirements?.needs_accessible && !isAccessible) return null
  if (requirements?.needs_overnight && !allowsOvernight) return null
  if (vehicleSpec.type === 'truck' && !allowsCommercial) return null

  // Calculate pricing based on vehicle type and spot features
  let basePrice = 2 + Math.random() * 8 // £2-10 base
  if (vehicleSpec.type === 'van') basePrice *= 1.3
  if (vehicleSpec.type === 'truck') basePrice *= 2.0
  if (hasCharging) basePrice += 2
  if (isCovered) basePrice += 1

  return {
    id: `spot_${index}_${vehicleSpec.type}`,
    name: `${isCovered ? 'Covered' : 'Open'} Parking Spot ${index + 1}`,
    location: { lat, lng },
    distance: Math.round(distance),
    dimensions: {
      length: Math.round(spotLength * 10) / 10,
      width: Math.round(spotWidth * 10) / 10,
      height: isCovered ? Math.round(spotHeight * 10) / 10 : null
    },
    features: {
      covered: isCovered,
      ev_charging: hasCharging,
      accessible: isAccessible,
      overnight_allowed: allowsOvernight,
      commercial_allowed: allowsCommercial,
      surface_type: Math.random() > 0.5 ? 'tarmac' : 'concrete'
    },
    pricing: {
      hourly: Math.round(basePrice * 100) / 100,
      daily: Math.round(basePrice * 8 * 100) / 100,
      weekly: Math.round(basePrice * 8 * 6 * 100) / 100
    },
    availability: {
      available_now: Math.random() > 0.3,
      next_available: Math.random() > 0.3 ? null : new Date(Date.now() + Math.random() * 4 * 60 * 60 * 1000).toISOString()
    },
    compatibility_score: calculateCompatibilityScore(vehicleSpec, {
      length: spotLength,
      width: spotWidth,
      height: spotHeight,
      covered: isCovered,
      charging: hasCharging
    }),
    restrictions: generateRestrictions(vehicleSpec)
  }
}

function calculateCompatibilityScore(vehicleSpec: any, spotSpec: any): number {
  let score = 100

  // Dimension scoring
  const lengthRatio = vehicleSpec.length / spotSpec.length
  const widthRatio = vehicleSpec.width / spotSpec.width
  
  if (lengthRatio > 0.9) score -= 20
  else if (lengthRatio > 0.8) score -= 10
  
  if (widthRatio > 0.9) score -= 20
  else if (widthRatio > 0.8) score -= 10

  // Feature bonuses
  if (vehicleSpec.needs_charging && spotSpec.charging) score += 15
  if (vehicleSpec.type === 'luxury_car' && spotSpec.covered) score += 10
  if (vehicleSpec.type === 'motorcycle' && spotSpec.covered) score += 5

  return Math.max(0, Math.min(100, score))
}

function generateRestrictions(vehicleSpec: any): string[] {
  const restrictions = []

  if (vehicleSpec.type === 'truck') {
    restrictions.push('Commercial vehicles only 6am-6pm')
    restrictions.push('Height restriction: 4.5m max')
  }

  if (vehicleSpec.type === 'van') {
    restrictions.push('Loading/unloading permitted')
    restrictions.push('Max stay: 4 hours during business hours')
  }

  if (vehicleSpec.type === 'motorcycle') {
    restrictions.push('Motorcycle bay only')
    restrictions.push('Helmet storage available')
  }

  if (vehicleSpec.needs_charging) {
    restrictions.push('EV charging: 4 hour max while charging')
  }

  return restrictions
}

// Additional endpoint for real-time availability
export async function PUT(request: NextRequest) {
  try {
    const { spot_id, vehicle_id, booking_duration } = await request.json()

    // Mock booking validation
    const vehicleSpec = VEHICLE_SPECS[vehicle_id as keyof typeof VEHICLE_SPECS]
    if (!vehicleSpec) {
      return NextResponse.json(
        { error: "Invalid vehicle type" },
        { status: 400 }
      )
    }

    // Simulate booking process
    const bookingId = `booking_${Date.now()}_${spot_id}`
    const startTime = new Date()
    const endTime = new Date(startTime.getTime() + booking_duration * 60 * 60 * 1000)

    return NextResponse.json({
      booking_id: bookingId,
      spot_id,
      vehicle: vehicleSpec,
      booking_window: {
        start: startTime.toISOString(),
        end: endTime.toISOString(),
        duration_hours: booking_duration
      },
      access_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
      qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${bookingId}`,
      instructions: generateBookingInstructions(vehicleSpec, spot_id)
    })

  } catch (error) {
    console.error("Error creating vehicle-specific booking:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

function generateBookingInstructions(vehicleSpec: any, spotId: string): string[] {
  const instructions = [`Navigate to parking spot ${spotId}`]

  if (vehicleSpec.type === 'truck') {
    instructions.push('Use commercial vehicle entrance')
    instructions.push('Check height clearance before entry')
    instructions.push('Turn off engine during extended stops')
  }

  if (vehicleSpec.type === 'motorcycle') {
    instructions.push('Use designated motorcycle bay')
    instructions.push('Secure helmet in provided storage')
    instructions.push('Chain bike to designated anchor point')
  }

  if (vehicleSpec.needs_charging) {
    instructions.push('Connect to EV charging point upon arrival')
    instructions.push('Charging session will start automatically')
    instructions.push('Disconnect when charging complete or before departure')
  }

  if (vehicleSpec.type === 'van') {
    instructions.push('Rear doors can be opened for loading/unloading')
    instructions.push('Keep loading time to minimum during peak hours')
  }

  instructions.push('Take photo of your vehicle for verification')
  instructions.push('Contact support if you need assistance')

  return instructions
}
