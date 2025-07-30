#!/bin/bash

echo "=== Testing what different crawlers see on parkalgo.com ==="
echo ""

echo "1. Regular browser request:"
curl -s -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" https://parkalgo.com/ | grep -A 5 -B 5 "<h1"

echo ""
echo "2. Googlebot request:"
curl -s -H "User-Agent: Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" https://parkalgo.com/ | grep -A 5 -B 5 "<h1"

echo ""
echo "3. Screaming Frog SEO Spider request:"
curl -s -H "User-Agent: Screaming Frog SEO Spider/19.0" https://parkalgo.com/ | grep -A 5 -B 5 "<h1"

echo ""
echo "4. Screaming Frog with full headers:"
curl -s -H "User-Agent: Screaming Frog SEO Spider/19.0" -H "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" -H "Accept-Language: en-US,en;q=0.5" https://parkalgo.com/ | grep -A 5 -B 5 "<h1"

echo ""
echo "5. Testing H2 tags with Screaming Frog:"
curl -s -H "User-Agent: Screaming Frog SEO Spider/19.0" https://parkalgo.com/ | grep -o "<h2[^>]*>[^<]*</h2>" | head -5

echo ""
echo "6. Checking if response is empty for Screaming Frog:"
response=$(curl -s -H "User-Agent: Screaming Frog SEO Spider/19.0" https://parkalgo.com/)
if [ -z "$response" ]; then
    echo "ERROR: Empty response for Screaming Frog user agent!"
else
    echo "Response received for Screaming Frog (length: ${#response} characters)"
    echo "First 200 characters:"
    echo "$response" | head -c 200
fi
