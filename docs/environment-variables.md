# Environment Variables Guide

This document outlines the environment variables used in Parking Angel and explains the security considerations.

## Security Principles

- **Client-side variables** (prefixed with `NEXT_PUBLIC_`) are exposed in the browser and should only contain non-sensitive data
- **Server-side variables** (no prefix) are kept secure on the server and accessed via API routes

## Required Environment Variables

### Database Configuration
\`\`\`bash
# Supabase Configuration (Client-side - safe to expose)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database URLs (Server-side - secure)
DATABASE_URL=postgresql://...
POSTGRES_URL=postgresql://...
POSTGRES_PRISMA_URL=postgresql://...
\`\`\`

### API Keys (Server-side only - secure)
\`\`\`bash
# Maps and Location Services
GOOGLE_MAPS_API_KEY=AIzaSyC...
GOOGLE_PLACES_API_KEY=AIzaSyC...
MAPBOX_ACCESS_TOKEN=pk.eyJ1...
TFL_API_KEY=your_tfl_key

# AI Services
GROQ_API_KEY=gsk_...
XAI_API_KEY=xai-...
\`\`\`

### Firebase Configuration
\`\`\`bash
# Firebase (Client-side - safe to expose with proper security rules)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-...

# Firebase Server Keys (Server-side - secure)
FIREBASE_VAPID_KEY=your_vapid_key
\`\`\`

### OAuth Configuration (Server-side - secure)
\`\`\`bash
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
\`\`\`

### Application URLs
\`\`\`bash
# App Configuration (Client-side - safe to expose)
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_SITE_URL=https://your-domain.com
\`\`\`

### Storage
\`\`\`bash
# Vercel Blob (Server-side - secure)
BLOB_READ_WRITE_TOKEN=vercel_blob_...
\`\`\`

## Security Best Practices

1. **Never expose API keys client-side** - Use server-side API routes to proxy requests
2. **Restrict API keys** - Configure proper restrictions in Google Cloud Console, Firebase, etc.
3. **Use environment-specific configs** - Different keys for development, staging, and production
4. **Regular key rotation** - Rotate API keys periodically
5. **Monitor usage** - Set up alerts for unusual API usage patterns

## API Key Restrictions

### Google Maps API Key
- **Application restrictions**: Restrict to your domain(s)
- **API restrictions**: Enable only required APIs (Maps JavaScript API, Places API, etc.)
- **Usage limits**: Set daily quotas to prevent abuse

### Firebase Configuration
- **Security rules**: Implement proper Firestore and Storage security rules
- **Domain restrictions**: Restrict to authorized domains
- **API key restrictions**: Limit to required Firebase services

### Mapbox Token
- **URL restrictions**: Restrict to your domain(s)
- **Scope restrictions**: Limit to required scopes only

## Development vs Production

### Development (.env.local)
\`\`\`bash
# Use development/testing API keys with lower quotas
GOOGLE_MAPS_API_KEY=AIzaSyC..._dev_key
MAPBOX_ACCESS_TOKEN=pk.eyJ1..._dev_token
\`\`\`

### Production (Vercel Environment Variables)
\`\`\`bash
# Use production API keys with proper restrictions
GOOGLE_MAPS_API_KEY=AIzaSyC..._prod_key
MAPBOX_ACCESS_TOKEN=pk.eyJ1..._prod_token
\`\`\`

## Troubleshooting

### Common Issues

1. **"API key not found"** - Ensure the key is set in the correct environment
2. **"API key restricted"** - Check domain/API restrictions in the provider console
3. **"Quota exceeded"** - Monitor usage and increase limits if needed
4. **"CORS errors"** - Verify domain restrictions and referrer settings

### Debugging

Use the environment check component at `/debug-supabase` to verify all configurations are correct.
\`\`\`

Now let me also update the README to reflect the security approach:
