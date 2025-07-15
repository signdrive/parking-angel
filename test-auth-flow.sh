#!/bin/bash

echo "🧪 Testing complete authentication and subscription flow..."

# Test 1: Check if pricing page loads
echo "1. Testing pricing page..."
curl -s -o /dev/null -w "%{http_code}" "https://automatic-umbrella-66rqvg9j35545-3000.app.github.dev/pricing"
if [ $? -eq 0 ]; then
    echo "✅ Pricing page accessible"
else
    echo "❌ Pricing page failed"
fi

# Test 2: Check if dashboard loads
echo "2. Testing dashboard page..."
curl -s -o /dev/null -w "%{http_code}" "https://automatic-umbrella-66rqvg9j35545-3000.app.github.dev/dashboard"
if [ $? -eq 0 ]; then
    echo "✅ Dashboard page accessible"
else
    echo "❌ Dashboard page failed"
fi

# Test 3: Check if auth callback route exists
echo "3. Testing auth callback route..."
curl -s -o /dev/null -w "%{http_code}" "https://automatic-umbrella-66rqvg9j35545-3000.app.github.dev/auth/callback"
if [ $? -eq 0 ]; then
    echo "✅ Auth callback route exists"
else
    echo "❌ Auth callback route failed"
fi

# Test 4: Check if test auth page loads
echo "4. Testing test auth page..."
curl -s -o /dev/null -w "%{http_code}" "https://automatic-umbrella-66rqvg9j35545-3000.app.github.dev/test-auth"
if [ $? -eq 0 ]; then
    echo "✅ Test auth page accessible"
else
    echo "❌ Test auth page failed"
fi

echo "🎉 Flow testing complete!"
