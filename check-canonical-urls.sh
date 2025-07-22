#!/bin/bash

echo "🔍 Checking canonical URLs and SEO issues..."

echo "📋 Checking sitemap..."
curl -s https://parkalgo.com/sitemap.xml | head -20

echo -e "\n📋 Checking robots.txt..."
curl -s https://parkalgo.com/robots.txt

echo -e "\n🏠 Checking homepage canonical..."
curl -s -I https://parkalgo.com/ | grep -i "location\|canonical"

echo -e "\n🔐 Checking login page canonical..."
curl -s -I https://parkalgo.com/auth/login | grep -i "location\|canonical"

echo -e "\n📝 Checking signup page canonical..."
curl -s -I https://parkalgo.com/auth/signup | grep -i "location\|canonical"

echo -e "\n✅ Canonical URL check complete!"
