#!/bin/bash

echo "🔍 Testing Favicon and SEO Assets..."

# Test favicon accessibility
echo "📌 Testing favicon.ico..."
curl -I https://www.parkalgo.com/favicon.ico

echo ""
echo "📌 Testing robots.txt..."
curl -I https://www.parkalgo.com/robots.txt

echo ""
echo "📌 Testing sitemap.xml..."
curl -I https://www.parkalgo.com/sitemap.xml

echo ""
echo "📌 Testing homepage for canonical URLs..."
curl -I https://www.parkalgo.com/ | grep -i "canonical\|content-type"

echo ""
echo "✅ Favicon and SEO asset tests complete!"
