#!/bin/bash

echo "🔍 Testing Dynamic Blog SEO - Canonical URL Implementation"
echo "==========================================================="

# Blog post slugs from database
BLOG_POST_1="the-future-of-urban-parking-how-cities-are-adapting-to-new-mobility-trends"
BLOG_POST_2="parking-optimization-in-big-cities-solving-urban-mobility-challenges"

echo ""
echo "📝 Testing Blog Posts..."
echo "========================"

echo "Testing: $BLOG_POST_1"
RESPONSE1=$(curl -s -m 10 "http://localhost:3000/blog/$BLOG_POST_1" | grep -i canonical || echo "No canonical found")
echo "Canonical URL: $RESPONSE1"

echo ""
echo "Testing: $BLOG_POST_2"
RESPONSE2=$(curl -s -m 10 "http://localhost:3000/blog/$BLOG_POST_2" | grep -i canonical || echo "No canonical found") 
echo "Canonical URL: $RESPONSE2"

echo ""
echo "🏷️ Testing Category Pages..."
echo "============================"

# Test common category slugs
echo "Testing category: technology"
CAT_RESPONSE=$(curl -s -m 10 "http://localhost:3000/blog/category/technology" | grep -i canonical || echo "No canonical found")
echo "Category canonical: $CAT_RESPONSE"

echo ""
echo "🔖 Testing Tag Pages..."
echo "======================="

# Test common tag slugs
echo "Testing tag: smart-parking"
TAG_RESPONSE=$(curl -s -m 10 "http://localhost:3000/blog/tag/smart-parking" | grep -i canonical || echo "No canonical found")
echo "Tag canonical: $TAG_RESPONSE"

echo ""
echo "🤖 Testing with Crawler User Agent..."
echo "====================================="

echo "Testing blog post with Googlebot:"
CRAWLER_RESPONSE=$(curl -s -m 10 -H "User-Agent: Googlebot/2.1 (+http://www.google.com/bot.html)" "http://localhost:3000/blog/$BLOG_POST_1" | grep -i canonical || echo "No canonical found")
echo "Crawler canonical: $CRAWLER_RESPONSE"

echo ""
echo "✅ Test Complete!"
echo "================="
echo "Expected canonical URLs should be:"
echo "- Blog posts: https://parkalgo.com/blog/{slug}"
echo "- Categories: https://parkalgo.com/blog/category/{slug}"  
echo "- Tags: https://parkalgo.com/blog/tag/{slug}"
