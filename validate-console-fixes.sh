#!/bin/bash

echo "🔍 Validating Console Error Fixes..."
echo "=================================="

# Check if the Next.js app is running
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Next.js app is running on localhost:3000"
else
    echo "❌ Next.js app is not running"
    echo "   Please run: npm run dev"
    exit 1
fi

echo ""
echo "🧪 Testing API Endpoints..."

# Test A/B testing admin API
AB_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/ab-testing/admin)
if [ "$AB_RESPONSE" = "200" ]; then
    echo "✅ A/B Testing Admin API: $AB_RESPONSE (OK)"
else
    echo "❌ A/B Testing Admin API: $AB_RESPONSE (Error)"
fi

# Test Marketing Automation API
MARKETING_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/marketing/automation)
if [ "$MARKETING_RESPONSE" = "200" ]; then
    echo "✅ Marketing Automation API: $MARKETING_RESPONSE (OK)"
else
    echo "❌ Marketing Automation API: $MARKETING_RESPONSE (Error)"
fi

# Test Analytics API
ANALYTICS_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d '{"event":"test_event","properties":{}}' -o /dev/null -w "%{http_code}" http://localhost:3000/api/analytics/track)
if [ "$ANALYTICS_RESPONSE" = "200" ]; then
    echo "✅ Analytics API: $ANALYTICS_RESPONSE (OK)"
else
    echo "❌ Analytics API: $ANALYTICS_RESPONSE (Error)"
fi

echo ""
echo "📁 Checking File Changes..."

# Check if layout.tsx has conditional GoogleAnalyticsProvider
if grep -q "process.env.NODE_ENV === 'production' && (" app/layout.tsx; then
    echo "✅ Layout.tsx: GoogleAnalyticsProvider conditionally loaded"
else
    echo "❌ Layout.tsx: GoogleAnalyticsProvider may not be conditional"
fi

# Check if analytics API has development guard
if grep -q "process.env.NODE_ENV !== 'production'" app/api/analytics/track/route.ts; then
    echo "✅ Analytics API: Development environment guard present"
else
    echo "❌ Analytics API: Development environment guard missing"
fi

# Check if dashboard component has retry logic
if grep -q "retryCount >= 3" components/admin/ab-testing-marketing-dashboard.tsx; then
    echo "✅ Dashboard Component: Retry limit logic present"
else
    echo "❌ Dashboard Component: Retry limit logic missing"
fi

echo ""
echo "🌐 Manual Testing Instructions:"
echo "1. Open http://localhost:3000 in browser"
echo "2. Open Developer Tools (F12)"
echo "3. Check Console tab - should be clean with minimal errors"
echo "4. Check Network tab - no failed requests to Google Analytics"
echo "5. Navigate to /dashboard - should load without infinite retries"
echo ""
echo "✅ Validation Complete!"
echo "If all checks pass, console errors should be resolved."
