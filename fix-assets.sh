#!/bin/bash

echo "🔧 Fixing Next.js static asset 404 errors..."

# Kill any existing Next.js processes
echo "1. Stopping any running Next.js processes..."
pkill -f "next dev" || true
pkill -f "next" || true

# Clean build cache
echo "2. Cleaning build cache..."
rm -rf .next
rm -rf node_modules/.cache

# Reinstall dependencies if needed (optional)
# echo "3. Reinstalling dependencies..."
# npm install

# Start fresh
echo "4. Starting fresh development server..."
npm run dev

echo "✅ Development server should now be running without 404 errors!"
