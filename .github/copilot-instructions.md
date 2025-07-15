# Copilot AI Coding Agent Instructions for parking-angel

## Status Update
**What we did:**
- ✅ Created `.github/copilot-instructions.md` with essential project patterns and workflows
- ✅ Started Next.js development server successfully (`npm run dev`)
- ✅ App is running at http://localhost:3000 with working routes: `/`, `/dashboard`, `/auth/login`
- ✅ Fixed plans page performance - replaced `window.location.href` with Next.js router for instant navigation
- ✅ Optimized upgrade buttons in dashboard to use client-side routing instead of full page reloads
- ✅ Fixed Edit Profile button functionality - added interactive edit mode with form handling
- ✅ Improved parking search flow - now follows proper UX: location → vehicle type → compatible spots
- ✅ Enhanced location selection with dual options: address search OR interactive map selection

**What we're doing next:**
- Monitor app performance and user experience improvements
- Continue optimizing page load times and navigation speed

## Project Overview
- **parking-angel** is a Next.js app for intelligent parking management, integrating Supabase (database/auth), Stripe (payments), Mapbox (maps), and custom AI/ML features.
- The architecture is modular: UI components in `components/`, backend logic in API routes, and test scripts in the root directory.
- Data flows from user actions (frontend) to Supabase (backend), with real-time updates and AI-driven recommendations.

## Key Workflows
- **Development:**
  - Start the app: `npm run dev` (see `package.json`)
  - Build: `npm run build`
  - Lint: `npm run lint`
- **Testing:**
  - Run integration tests (e.g., Supabase table tests): `node test-spot-reports-table.js`
  - Many test scripts are in the root, named `test-*.js` (see also `test/` folder).
  - Ensure required environment variables (e.g., `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) are set for tests.
- **Configuration:**
  - Next.js config: `next.config.mjs` (custom headers, CSP, redirects, env vars)
  - Tailwind: `tailwind.config.ts`
  - Supabase: see `.env` and scripts using `@supabase/supabase-js`

## Project-Specific Patterns
- **Supabase Integration:**
  - Use `@supabase/supabase-js` for all DB access (see `test-spot-reports-table.js` for usage pattern).
  - Environment variables are required for DB access; fail fast if missing.
- **AI Features:**
  - AI/ML logic is in `components/ai/` (e.g., `ai-assistant.tsx`, `prediction-dashboard.tsx`).
  - Use React hooks and context for state and data flow in AI components.
- **Security:**
  - Strict Content Security Policy and custom headers are set in `next.config.mjs`.
  - Stripe and Mapbox integrations are whitelisted in CSP.
- **Testing Conventions:**
  - Test scripts are self-contained, log results to console, and clean up test data (see `test-spot-reports-table.js`).
  - Prefer direct DB/API calls over UI automation for backend tests.

## Integration Points
- **Supabase:** Auth, DB, real-time updates
- **Stripe:** Payment flows
- **Mapbox:** Maps and geolocation
- **AI/ML:** Custom logic in `components/ai/`

## Examples
- See `test-spot-reports-table.js` for Supabase test patterns.
- See `components/ai/ai-assistant.tsx` for AI UI/logic patterns.
- See `next.config.mjs` for security and integration config.

---
For more, check `README.md`, `package.json`, and relevant scripts/components.
