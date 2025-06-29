# Park Algo

An intelligent parking management system with real-time spot detection, AI-powered predictions, and seamless navigation.

## 🚀 Features

- **Real-time Parking Detection** - Live parking spot availability
- **AI-Powered Predictions** - Smart availability forecasting
- **Interactive Maps** - Mapbox integration with custom markers
- **Navigation System** - Turn-by-turn directions to parking spots
- **Multi-Provider Support** - Google Places, TfL, and custom data sources
- **Progressive Web App** - Install on mobile devices
- **Voice Assistant** - AI-powered parking assistant
- **Analytics Dashboard** - Usage insights and trends
- **Premium Subscription** - Tiered subscription plans via Stripe

## 🔧 Quick Setup

### 1. Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/parking-angel)

### 2. Add Integrations

- **Supabase** - Database and authentication
- **Vercel Blob** - File storage
- **Stripe** - Payment processing for subscriptions

### 3. Configure Environment Variables

#### Required (Server-side only - secure)
\`\`\`bash
# API Keys - Never expose these client-side
GOOGLE_MAPS_API_KEY=your_google_maps_key
MAPBOX_ACCESS_TOKEN=your_mapbox_token
GROQ_API_KEY=your_groq_key

# OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Stripe (Server-side only)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
\`\`\`

#### Public (Client-side - safe to expose)
\`\`\`bash
# Supabase (with proper RLS policies)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# App URLs
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Stripe (Public)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
\`\`\`

### 4. Run Database Scripts

Execute the SQL scripts in order:
1. `scripts/001-create-tables.sql`
2. `scripts/002-create-functions.sql`
3. `scripts/003-seed-data.sql`

## 🔒 Security

This application follows security best practices:

- **API keys are server-side only** - No sensitive keys exposed to the client
- **Secure API proxying** - All external API calls go through server routes
- **Environment variable validation** - Built-in checks for proper configuration
- **Row Level Security** - Supabase RLS policies protect user data

## 🛠️ Development

### Local Development

\`\`\`bash
# Clone the repository
git clone https://github.com/your-username/parking-angel.git
cd parking-angel

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
\`\`\`

### Docker Development

\`\`\`bash
# Build and run with Docker
make dev

# Or manually
docker-compose -f docker-compose.dev.yml up --build
\`\`\`

## 📱 Progressive Web App

Parking Angel is a full PWA with:

- **Offline support** - Works without internet connection
- **Push notifications** - Real-time parking alerts
- **Install prompt** - Add to home screen
- **Background sync** - Sync data when connection returns

## 🤖 AI Features

- **Smart Predictions** - ML-powered availability forecasting
- **Voice Assistant** - Natural language parking queries
- **Route Optimization** - AI-optimized parking recommendations
- **Demand Analysis** - Real-time demand level calculations

## 🗺️ Supported Data Sources

- **Google Places API** - Commercial parking locations
- **Transport for London (TfL)** - London parking data
- **Mapbox** - Map rendering and navigation
- **User Reports** - Community-driven spot reporting

## 📊 Analytics

Built-in analytics track:

- Parking spot usage patterns
- User behavior and preferences
- API performance and costs
- Real-time system health

## 🔧 Configuration

### API Key Setup

1. **Google Maps API**
   - Enable Maps JavaScript API, Places API
   - Set domain restrictions
   - Configure usage quotas

2. **Mapbox**
   - Create access token
   - Set URL restrictions
   - Configure scopes

3. **Supabase**
   - Set up database
   - Configure RLS policies
   - Enable real-time subscriptions

### Environment Validation

Visit `/debug-supabase` to validate your configuration and test all integrations.

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository
2. Add environment variables
3. Deploy automatically on push

### Docker

\`\`\`bash
# Production build
docker-compose up --build

# With custom environment
docker-compose -f docker-compose.prod.yml up
\`\`\`

## 📝 Subscription Management

### Testing Subscriptions

We provide several scripts to help test and manage the subscription flow:

#### 1. Update User Subscription

\`\`\`bash
# Check and update a user's subscription (defaults to premium tier)
node test-subscription-update.js USER_ID

# Specify a different tier (free, premium, pro, enterprise)
node test-subscription-update.js USER_ID pro
\`\`\`

#### 2. Verify Webhook Configuration

\`\`\`bash
# Check Stripe webhook configuration and recent events
node test-live-webhook.js
\`\`\`

#### 3. System Health Check

\`\`\`bash
# Perform a complete subscription system health check
node verify-subscription-health.js
\`\`\`

#### 4. Full Documentation

For complete testing procedures, see:
- [Live Testing Guide](LIVE_TESTING_GUIDE.md)
- [Webhook Debug Guide](WEBHOOK_DEBUG_GUIDE.md)
- [Final Verification](FINAL_VERIFICATION.md)

### Stripe Product Configuration

The subscription system expects the following products in your Stripe account:

| Plan Name      | Stripe Product ID | Metadata: plan_id  | Tier in Database |
|----------------|-------------------|-------------------|------------------|
| Navigator      | prod_xxx          | navigator         | premium          |
| Pro Parker     | prod_xxx          | pro_parker        | pro              |
| Fleet Manager  | prod_xxx          | fleet_manager     | enterprise       |

## 📚 API Documentation

### Parking Spots

\`\`\`typescript
// Get nearby spots
GET /api/spots/nearby?lat=51.5074&lng=-0.1278&radius=1000

// Report new spot
POST /api/spots/report
{
  "latitude": 51.5074,
  "longitude": -0.1278,
  "spotType": "street",
  "confidence": 85
}
\`\`\`

### Navigation

\`\`\`typescript
// Calculate route
POST /api/navigation/calculate-route
{
  "origin": [lng, lat],
  "destination": [lng, lat],
  "options": { "avoidTraffic": true }
}
\`\`\`

### Subscription

\`\`\`typescript
// Create checkout session
POST /api/stripe/create-checkout-session
{
  "tier": "navigator" // Or "pro_parker", "fleet_manager"
}

// Verify payment
GET /api/stripe/verify-session?session_id=cs_test_xxx

// Webhook (Stripe POST callback)
POST /api/stripe-webhook
// Stripe signature required in headers
\`\`\`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🆘 Support

- **Documentation**: Check the `/docs` folder
- **Issues**: Create a GitHub issue
- **Discussions**: Use GitHub Discussions
- **Email**: support@parking-angel.com

---

Built with ❤️ using Next.js, Supabase, and Mapbox
