# Production Deployment Guide for parkalgo.com

## ✅ Pre-Deployment (Completed)

- [x] Updated early adopter messaging across all pages
- [x] Updated test-local-auth.js to handle both local and production environments
- [x] Added production-check.js script
- [x] Updated .env.local with production URL comments
- [x] Next.js configuration optimized for production

## 🔄 OAuth Configuration Updates Required

### Supabase Dashboard
URL: https://supabase.com/dashboard/projects/vzhvpecwnjssurxbyzph/auth/url-configuration

**Site URL:**
```
https://parkalgo.com
```

**Redirect URLs (add all of these):**
```
https://parkalgo.com/auth/callback
https://parkalgo.com/auth/callback-implicit
http://localhost:3000/auth/callback
http://localhost:3000/auth/callback-implicit
```

### Google Cloud Console
URL: https://console.cloud.google.com/apis/credentials

**OAuth 2.0 Client ID - Authorized redirect URIs:**
```
https://parkalgo.com/auth/callback
http://localhost:3000/auth/callback
```

## ⚙️ Vercel Environment Variables

Go to: https://vercel.com/dashboard → parkalgo project → Settings → Environment Variables

**Add/Update these:**
```bash
NEXT_PUBLIC_SITE_URL="https://parkalgo.com"
NEXT_PUBLIC_APP_URL="https://parkalgo.com"
NODE_ENV="production"
```

## 🚀 Ready to Commit and Deploy

All files have been updated and are ready for deployment to parkalgo.com!
