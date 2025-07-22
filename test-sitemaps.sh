#!/bin/bash

echo "🗺️ Checking sitemap implementation..."

echo "📋 Main sitemap:"
curl -s "https://parkalgo.com/sitemap.xml" | head -20

echo -e "\n📝 Blog sitemap:"
curl -s "https://parkalgo.com/blog/sitemap.xml" | head -20

echo -e "\n🤖 Robots.txt:"
curl -s "https://parkalgo.com/robots.txt"

echo -e "\n🔗 Testing blog post URLs:"
echo "Blog main: https://parkalgo.com/blog"
echo "Post 1: https://parkalgo.com/blog/how-ai-reduces-parking-congestion"
echo "Post 2: https://parkalgo.com/blog/parking-algorithm-case-studies"

echo -e "\n✅ Sitemap check complete!"
