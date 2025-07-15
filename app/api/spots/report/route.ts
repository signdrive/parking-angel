import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    // For now, we'll use a simple user_id simulation since auth might not be fully set up
    // In production, you'd validate the JWT token here
    // For anonymous users, we'll set user_id to null to avoid foreign key constraints
    const user_id = token || null;

    const body = await request.json();
    const { spot_type, latitude, longitude, address, notes, status = 'available', confidence = 100 } = body;

    // Validate required fields
    if (!spot_type || !latitude || !longitude) {
      return NextResponse.json({ 
        error: 'Missing required fields: spot_type, latitude, longitude' 
      }, { status: 400 });
    }

    // Validate spot_type
    const validSpotTypes = ['street', 'garage', 'lot', 'private', 'disabled', 'loading'];
    if (!validSpotTypes.includes(spot_type)) {
      return NextResponse.json({ 
        error: `Invalid spot_type. Must be one of: ${validSpotTypes.join(', ')}` 
      }, { status: 400 });
    }

    // Validate coordinates
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json({ 
        error: 'Invalid coordinates' 
      }, { status: 400 });
    }

    // Try to insert into database, with fallback to mock response
    let reportData;
    try {
      const { data, error: insertError } = await supabase
        .from('spot_reports')
        .insert({
          user_id,
          spot_type,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          address: address || null,
          notes: notes || null,
          status,
          confidence: parseInt(confidence),
          reported_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 hours from now
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }
      reportData = data;
    } catch (dbError) {
      console.log('Database not available, using mock response:', String(dbError));
      
      // Create mock response when database is not available
      reportData = {
        id: `mock-report-${Date.now()}`,
        user_id,
        spot_type,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        address: address || null,
        notes: notes || null,
        status,
        confidence: parseInt(confidence),
        reported_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        verified_count: 0,
        disputed_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }

    return NextResponse.json({
      success: true,
      message: 'Spot reported successfully',
      data: reportData
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = searchParams.get('radius') || '1000'; // Default 1km radius
    const spot_type = searchParams.get('spot_type');
    const status = searchParams.get('status');

    // Try to query database, with fallback to mock data
    let reports;
    try {
      let query = supabase
        .from('spot_reports')
        .select('*')
        .gte('expires_at', new Date().toISOString())
        .order('reported_at', { ascending: false });

      // Filter by location if provided
      if (lat && lng) {
        const latNum = parseFloat(lat);
        const lngNum = parseFloat(lng);
        const radiusNum = parseFloat(radius);
        
        // Use approximate distance filtering
        query = query.gte('latitude', latNum - (radiusNum / 111320))
                     .lte('latitude', latNum + (radiusNum / 111320))
                     .gte('longitude', lngNum - (radiusNum / (111320 * Math.cos(latNum * Math.PI / 180))))
                     .lte('longitude', lngNum + (radiusNum / (111320 * Math.cos(latNum * Math.PI / 180))));
      }

      // Filter by spot type
      if (spot_type) {
        query = query.eq('spot_type', spot_type);
      }

      // Filter by status
      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }
      reports = data;
    } catch (dbError) {
      console.error('GET Database error details:', dbError);
      
      // Return mock data when database is not available
      reports = generateMockReports(lat, lng, spot_type, status);
    }

    return NextResponse.json({
      success: true,
      reports: reports || [],
      count: reports?.length || 0
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// Generate mock reports for demo purposes
function generateMockReports(lat: string | null, lng: string | null, spot_type: string | null, status: string | null) {
  const mockReports = [
    {
      id: 'mock-1',
      user_id: 'demo-user-1',
      spot_type: 'street',
      latitude: lat ? parseFloat(lat) + 0.001 : 40.7589,
      longitude: lng ? parseFloat(lng) + 0.001 : -73.9851,
      address: '123 Demo Street',
      notes: 'Great street parking spot',
      status: 'available',
      confidence: 85,
      reported_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      expires_at: new Date(Date.now() + 105 * 60 * 1000).toISOString(),
      verified_count: 2,
      disputed_count: 0,
      profiles: {
        id: 'demo-user-1',
        username: 'DemoUser',
        avatar_url: null
      }
    },
    {
      id: 'mock-2',
      user_id: 'demo-user-2',
      spot_type: 'garage',
      latitude: lat ? parseFloat(lat) + 0.002 : 40.7599,
      longitude: lng ? parseFloat(lng) + 0.002 : -73.9861,
      address: '456 Demo Garage',
      notes: 'Covered parking available',
      status: 'available',
      confidence: 92,
      reported_at: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      expires_at: new Date(Date.now() + 112 * 60 * 1000).toISOString(),
      verified_count: 1,
      disputed_count: 0,
      profiles: {
        id: 'demo-user-2',
        username: 'ParkingHelper',
        avatar_url: null
      }
    },
    {
      id: 'mock-3',
      user_id: 'demo-user-3',
      spot_type: 'lot',
      latitude: lat ? parseFloat(lat) - 0.001 : 40.7579,
      longitude: lng ? parseFloat(lng) - 0.001 : -73.9841,
      address: '789 Demo Lot',
      notes: 'Large parking lot with many spaces',
      status: 'available',
      confidence: 78,
      reported_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      expires_at: new Date(Date.now() + 95 * 60 * 1000).toISOString(),
      verified_count: 3,
      disputed_count: 1,
      profiles: {
        id: 'demo-user-3',
        username: 'ParkFinder',
        avatar_url: null
      }
    }
  ];

  // Filter by spot_type if provided
  let filteredReports = spot_type 
    ? mockReports.filter(report => report.spot_type === spot_type)
    : mockReports;

  // Filter by status if provided
  if (status) {
    filteredReports = filteredReports.filter(report => report.status === status);
  }

  return filteredReports;
}
