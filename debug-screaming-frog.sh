#!/bin/bash

echo "=== COMPREHENSIVE SCREAMING FROG DEBUG TEST ==="
echo "Testing https://parkalgo.com/"
echo ""

# Test 1: Check if we get any content with Screaming Frog user agent
echo "1. Raw response check for Screaming Frog:"
response=$(curl -s -H "User-Agent: Screaming Frog SEO Spider/19.0" https://parkalgo.com/)
echo "Response length: ${#response} characters"

if [ ${#response} -gt 1000 ]; then
    echo "✓ Response received successfully"
    
    # Test 2: Check for H1 tags
    echo ""
    echo "2. H1 tag analysis:"
    h1_tags=$(echo "$response" | grep -o '<h1[^>]*>[^<]*</h1>' | head -5)
    if [ -n "$h1_tags" ]; then
        echo "✓ H1 tags found:"
        echo "$h1_tags"
    else
        echo "✗ NO H1 tags found!"
        echo "Searching for any heading tags..."
        echo "$response" | grep -o '<h[1-6][^>]*>[^<]*</h[1-6]>' | head -10
    fi
    
    # Test 3: Check for H2 tags
    echo ""
    echo "3. H2 tag analysis:"
    h2_tags=$(echo "$response" | grep -o '<h2[^>]*>[^<]*</h2>' | head -10)
    if [ -n "$h2_tags" ]; then
        echo "✓ H2 tags found:"
        echo "$h2_tags"
    else
        echo "✗ NO H2 tags found!"
    fi
    
    # Test 4: Check for React/Next.js hydration markers
    echo ""
    echo "4. React/Next.js content analysis:"
    if echo "$response" | grep -q "__NEXT_DATA__"; then
        echo "✓ Next.js data found"
    else
        echo "⚠ No Next.js data marker found"
    fi
    
    if echo "$response" | grep -q "react"; then
        echo "✓ React content detected"
    else
        echo "⚠ No React content detected"
    fi
    
    # Test 5: Check the actual title
    echo ""
    echo "5. Title analysis:"
    title=$(echo "$response" | grep -o '<title[^>]*>[^<]*</title>')
    if [ -n "$title" ]; then
        echo "✓ Title found: $title"
    else
        echo "✗ NO title found!"
    fi
    
    # Test 6: Check meta description
    echo ""
    echo "6. Meta description analysis:"
    meta_desc=$(echo "$response" | grep -o '<meta[^>]*name="description"[^>]*>')
    if [ -n "$meta_desc" ]; then
        echo "✓ Meta description found: $meta_desc"
    else
        echo "✗ NO meta description found!"
    fi
    
    # Test 7: Save full response for manual inspection
    echo ""
    echo "7. Saving full response to /tmp/screaming-frog-response.html for inspection"
    echo "$response" > /tmp/screaming-frog-response.html
    echo "✓ Response saved to /tmp/screaming-frog-response.html"
    
    # Test 8: Check for any error indicators
    echo ""
    echo "8. Error analysis:"
    if echo "$response" | grep -qi "error\|404\|500\|not found"; then
        echo "⚠ Error indicators found in response"
        echo "$response" | grep -i "error\|404\|500\|not found" | head -3
    else
        echo "✓ No obvious error indicators"
    fi
    
else
    echo "✗ Empty or very small response received!"
    echo "This suggests Screaming Frog is being blocked or redirected"
    
    # Test detailed headers
    echo ""
    echo "Testing with detailed headers:"
    curl -v -H "User-Agent: Screaming Frog SEO Spider/19.0" https://parkalgo.com/ 2>&1 | head -20
fi

# Test 9: Compare with regular browser
echo ""
echo "9. Comparison with regular browser:"
browser_response=$(curl -s -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" https://parkalgo.com/)
echo "Browser response length: ${#browser_response} characters"

browser_h1=$(echo "$browser_response" | grep -o '<h1[^>]*>[^<]*</h1>' | head -1)
if [ -n "$browser_h1" ]; then
    echo "✓ Browser can see H1: $browser_h1"
else
    echo "✗ Browser also cannot see H1 tags!"
fi
