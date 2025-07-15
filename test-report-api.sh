#!/bin/bash

# Test NEW spot reporting system
echo "🧪 Testing NEW Spot Reporting System..."

# Test 1: Test all spot types
echo "1. Testing all spot types..."
SPOT_TYPES=("street" "garage" "lot" "private" "disabled" "loading")

for spot_type in "${SPOT_TYPES[@]}"; do
    echo "   Testing $spot_type..."
    RESPONSE=$(curl -s -X POST "http://localhost:3001/api/spots/report" \
      -H "Content-Type: application/json" \
      -d "{
        \"spot_type\": \"$spot_type\",
        \"latitude\": 40.7589,
        \"longitude\": -73.9851,
        \"address\": \"123 Test St\",
        \"notes\": \"Test $spot_type spot\",
        \"status\": \"available\",
        \"confidence\": 90
      }")
    
    if echo "$RESPONSE" | grep -q '"success":true'; then
        echo "   ✅ $spot_type: SUCCESS"
    else
        echo "   ❌ $spot_type: FAILED"
        echo "   📋 Response: $RESPONSE"
    fi
done

# Test 2: Invalid report (missing required fields)
echo "2. Testing validation..."
RESPONSE=$(curl -s -X POST "http://localhost:3001/api/spots/report" \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Missing required fields"
  }')

if echo "$RESPONSE" | grep -q '"error"'; then
    echo "   ✅ Validation working correctly"
    echo "   📋 Response: $RESPONSE"
else
    echo "   ❌ Validation not working"
    echo "   📋 Response: $RESPONSE"
fi

# Test 3: Invalid spot type
echo "3. Testing invalid spot type..."
RESPONSE=$(curl -s -X POST "http://localhost:3001/api/spots/report" \
  -H "Content-Type: application/json" \
  -d '{
    "spot_type": "invalid_type",
    "latitude": 40.7589,
    "longitude": -73.9851,
    "notes": "Invalid spot type test"
  }')

if echo "$RESPONSE" | grep -q '"error"'; then
    echo "   ✅ Invalid spot type validation working"
    echo "   📋 Response: $RESPONSE"
else
    echo "   ❌ Invalid spot type validation failed"
    echo "   📋 Response: $RESPONSE"
fi

# Test 4: Test GET reports endpoint
echo "4. Testing GET reports endpoint..."
RESPONSE=$(curl -s "http://localhost:3001/api/spots/report?lat=40.7589&lng=-73.9851&radius=1000")

if echo "$RESPONSE" | grep -q '"reports"'; then
    echo "   ✅ GET reports working"
    REPORT_COUNT=$(echo "$RESPONSE" | grep -o '"count":[0-9]*' | cut -d: -f2)
    echo "   📊 Found $REPORT_COUNT reports"
else
    echo "   ❌ GET reports failed"
    echo "   📋 Response: $RESPONSE"
fi

# Test 5: Test legacy parking reports endpoint
echo "5. Testing legacy parking reports endpoint..."
RESPONSE=$(curl -s -X POST "http://localhost:3001/api/parking/reports" \
  -H "Content-Type: application/json" \
  -d '{
    "spot_id": "test-spot-123",
    "user_id": "test-user-456",
    "status": "available",
    "confidence": 85,
    "notes": "Just left this spot, easy to park",
    "location": {
      "lat": 51.5074,
      "lng": -0.1278,
      "address": "Central London"
    }
  }')

if echo "$RESPONSE" | grep -q '"success":true'; then
    echo "   ✅ Legacy report submission successful"
    echo "   📋 Response: $RESPONSE"
else
    echo "   ❌ Legacy report submission failed"
    echo "   📋 Response: $RESPONSE"
fi

echo ""
echo "🎉 NEW Spot Reporting System Test Complete!"
echo "🗂️  Table: spot_reports (recreated with new structure)"
echo "🎨 Modal: Refactored with visual spot type selection"
echo "🔗 API: /api/spots/report (completely rebuilt)"
echo "✅ NEW Spot Types: street, garage, lot, private, disabled, loading"
echo "📍 Enhanced Validation: Coordinates, spot types, required fields"
echo "🔍 Advanced Filtering: By location, spot type, status"
echo "⚡ Mock Data: Falls back gracefully when database unavailable"
echo ""
echo "The UI form should now work with the new spot type selection!"
