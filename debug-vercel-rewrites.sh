#!/bin/bash

echo "=== COMPREHENSIVE VERCEL REWRITE DEBUG ==="
echo "Testing https://parkalgo.com/ with different approaches"
echo ""

# Test 1: Test static HTML file directly
echo "1. Direct static HTML test:"
curl -s "https://parkalgo.com/seo.html" | grep -o '<h1[^>]*>[^<]*</h1>' | head -1
echo ""

# Test 2: Test API endpoint
echo "2. API endpoint test:"
response=$(curl -s "https://parkalgo.com/api/seo/")
echo "Response length: ${#response}"
if [ ${#response} -gt 100 ]; then
    echo "$response" | grep -o '<h1[^>]*>[^<]*</h1>' | head -1
else
    echo "Response too short: $response"
fi
echo ""

# Test 3: Test with specific Screaming Frog user agent
echo "3. Screaming Frog user agent test (Vercel rewrite):"
response=$(curl -s -H "User-Agent: Screaming Frog SEO Spider/19.0" "https://parkalgo.com/")
echo "Response length: ${#response}"
if [ ${#response} -gt 100 ]; then
    echo "$response" | grep -o '<h1[^>]*>[^<]*</h1>' | head -1
else
    echo "Response: $response"
fi
echo ""

# Test 4: Test with simple bot user agent
echo "4. Simple bot user agent test:"
response=$(curl -s -H "User-Agent: TestBot/1.0" "https://parkalgo.com/")
echo "Response length: ${#response}"
if [ ${#response} -gt 100 ]; then
    echo "$response" | grep -o '<h1[^>]*>[^<]*</h1>' | head -1
else
    echo "Response: $response"
fi
echo ""

# Test 5: Test with crawler user agent
echo "5. Crawler user agent test:"
response=$(curl -s -H "User-Agent: TestCrawler/1.0" "https://parkalgo.com/")
echo "Response length: ${#response}"
if [ ${#response} -gt 100 ]; then
    echo "$response" | grep -o '<h1[^>]*>[^<]*</h1>' | head -1
else
    echo "Response: $response"
fi
echo ""

# Test 6: Test with spider user agent
echo "6. Spider user agent test:"
response=$(curl -s -H "User-Agent: TestSpider/1.0" "https://parkalgo.com/")
echo "Response length: ${#response}"
if [ ${#response} -gt 100 ]; then
    echo "$response" | grep -o '<h1[^>]*>[^<]*</h1>' | head -1
else
    echo "Response: $response"
fi
echo ""

echo "=== END DEBUG ==="
