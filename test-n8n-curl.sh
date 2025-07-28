#!/bin/bash
# Test n8n blog workflow with curl

echo "🚀 Testing n8n Blog API with curl..."
echo ""

# API configuration
API_KEY="test-api-key-12345"
BASE_URL="http://localhost:3000"

# Test data
POST_DATA='{
  "title": "Smart Parking Analytics Dashboard",
  "content": "<h2>Real-Time Analytics</h2><p>Our new dashboard provides real-time insights into parking patterns, usage trends, and revenue optimization.</p><h2>Key Features</h2><ul><li>Live occupancy tracking</li><li>Revenue analytics</li><li>User behavior insights</li><li>Predictive modeling</li></ul>",
  "excerpt": "Introducing our new analytics dashboard for comprehensive parking management insights.",
  "category_slug": "technology",
  "tags": ["analytics", "dashboard", "parking", "data"],
  "published": false,
  "featured": true
}'

echo "📝 Creating blog post via API..."
echo ""

curl -X POST "${BASE_URL}/api/blog/posts" \
  -H "x-api-key: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -H "x-n8n-webhook-id: test-curl-webhook" \
  -d "${POST_DATA}" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s

echo ""
echo "📖 Retrieving blog posts..."
echo ""

curl -X GET "${BASE_URL}/api/blog/posts?limit=3" \
  -H "x-api-key: ${API_KEY}" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s

echo ""
echo "🔒 Testing security (invalid API key)..."
echo ""

curl -X POST "${BASE_URL}/api/blog/posts" \
  -H "x-api-key: invalid-key" \
  -H "Content-Type: application/json" \
  -d "${POST_DATA}" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s

echo ""
echo "✅ n8n Blog API test completed!"
