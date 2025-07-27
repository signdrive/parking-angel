#!/bin/bash
# Git push script

echo "Starting git operations..."

# Add all changes
git add .

# Commit changes
git commit -m "🔧 Fix Google Analytics development environment and TypeScript errors

✅ Fixed Issues:
- Fixed Google Analytics to properly disable in development environment
- Updated trackPageView function signature to accept optional title parameter
- Enhanced development environment detection with multiple checks
- Removed conflicting favicon and devtools route files

📊 Google Analytics:
- Added isDevelopmentEnvironment() helper function
- Prevents all GA scripts and tracking in development
- Eliminates network requests and console errors in dev mode
- Maintains full functionality in production

🐛 TypeScript Fixes:
- Fixed trackPageView function signature for optional title parameter
- Resolved argument count errors in page components"

# Push to remote
git push origin main --force

echo "Git operations completed!"
