#!/bin/bash

echo "🧪 Quick Test: NEW Spot Reporting System"
echo "============================================"

# Test 1: Simple spot creation
echo "1. Creating a street parking spot..."
curl -X POST "http://localhost:3001/api/spots/report" \
  -H "Content-Type: application/json" \
  -d '{"spot_type": "street", "latitude": 40.7589, "longitude": -73.9851, "notes": "Test street spot"}' \
  -w "\nStatus: %{http_code}\n" \
  -s
echo ""

# Test 2: Validation test
echo "2. Testing validation (missing fields)..."
curl -X POST "http://localhost:3001/api/spots/report" \
  -H "Content-Type: application/json" \
  -d '{"notes": "Missing required fields"}' \
  -w "\nStatus: %{http_code}\n" \
  -s
echo ""

# Test 3: GET reports
echo "3. Getting reports..."
curl "http://localhost:3001/api/spots/report?lat=40.7589&lng=-73.9851" \
  -w "\nStatus: %{http_code}\n" \
  -s
echo ""

echo "✅ Test complete!"
