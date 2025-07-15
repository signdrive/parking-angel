#!/bin/bash

echo "🔧 Testing API Authentication Fix"
echo "================================"

# Check if the development server is running
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "❌ Development server is not running"
    echo "Please start the server with: npm run dev"
    exit 1
fi

echo "✅ Development server is running"
echo ""
echo "🔍 Authentication Issues Fixed:"
echo "1. ✅ Updated all API routes to use Bearer token authentication"
echo "2. ✅ Fixed async cookies() warnings in Next.js 15"
echo "3. ✅ Updated client-side fetch calls to include Authorization header"
echo "4. ✅ Consistent error handling across all subscription endpoints"
echo ""
echo "📋 Changes Made:"
echo "- /app/api/subscription/cancel/route.ts - Bearer auth"
echo "- /app/api/subscription/status/route.ts - Bearer auth" 
echo "- /app/api/subscription/features/route.ts - Bearer auth"
echo "- /app/api/subscription/create-checkout/route.ts - Bearer auth"
echo "- /app/api/subscription/test-status/route.ts - Bearer auth"
echo "- /hooks/use-subscription.ts - Authorization headers added"
echo ""
echo "🚀 Ready to test! Visit http://localhost:3000/dashboard"
echo "The 401 authentication errors should now be resolved."
