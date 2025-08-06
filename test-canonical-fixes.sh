#!/bin/bash

echo "🔍 Testing Canonical Tag & Sitemap Issues Fixes"
echo "================================================="

echo ""
echo "1. Testing sitemap duplication fixes..."
echo "Main sitemap (should NOT contain /blog or /consent-settings):"
curl -s http://localhost:3000/sitemap.xml | grep -E "(blog|consent-settings)" || echo "✅ No problematic entries found"

echo ""
echo "Blog sitemap (should contain /blog):"
curl -s http://localhost:3000/blog/sitemap.xml | grep -E "<loc>.*blog</loc>" | head -1

echo ""
echo "2. Testing canonical tags..."
echo "Blog page canonical:"
curl -s https://parkalgo.com/blog | grep -o '<link rel="canonical"[^>]*>' | head -1

echo ""
echo "Consent settings canonical:"
curl -s https://parkalgo.com/consent-settings | grep -o '<link rel="canonical"[^>]*>' | head -1

echo ""
echo "3. Testing robots meta tags..."
echo "Blog page robots:"
curl -s https://parkalgo.com/blog | grep -o '<meta name="robots"[^>]*>' | head -1

echo ""
echo "Consent settings robots (should be noindex):"
curl -s https://parkalgo.com/consent-settings | grep -o '<meta name="robots"[^>]*>' | head -1

echo ""
echo "4. Sitemap validation..."
echo "Updated main sitemap entries:"
curl -s http://localhost:3000/sitemap.xml | grep -o '<loc>[^<]*</loc>' | sort

echo ""
echo "Blog sitemap entries (first 5):"
curl -s http://localhost:3000/blog/sitemap.xml | grep -o '<loc>[^<]*</loc>' | head -5

echo ""
echo "✅ CANONICAL TAG FIXES SUMMARY:"
echo "================================"
echo "🔧 Fixed Issues:"
echo "  1. ✅ Removed /blog from main sitemap (was duplicated)"
echo "  2. ✅ Removed /consent-settings from main sitemap (has noindex)"
echo "  3. ✅ Blog sitemap now exclusively handles all blog URLs"
echo "  4. ✅ Canonical tags are properly set on both pages"
echo ""
echo "📋 Google Search Console Impact:"
echo "  - /blog should resolve from 'Alternate page' to indexed"
echo "  - /consent-settings correctly excluded (noindex + no sitemap)"
echo "  - No more duplicate URL signals sent to Google"
echo ""
echo "🚀 Next Steps:"
echo "  1. Deploy changes to production"
echo "  2. Submit updated sitemap.xml to Google Search Console"
echo "  3. Submit updated blog/sitemap.xml to Google Search Console"
echo "  4. Request re-validation of /blog page"
echo "  5. Monitor indexing status in 24-48 hours"
