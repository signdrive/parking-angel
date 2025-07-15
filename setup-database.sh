#!/bin/bash

# Database Setup Script for Parking Angel
# This script sets up all the necessary database tables and data

echo "🚀 Setting up Parking Angel database..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Check if we're in a Supabase project
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Not in a Supabase project directory. Please run 'supabase init' first."
    exit 1
fi

# Start Supabase if not running
echo "🔄 Starting Supabase..."
supabase start

# Run migrations
echo "📊 Running database migrations..."
supabase db reset

# Apply migrations
echo "🔧 Applying migrations..."
for migration in supabase/migrations/*.sql; do
    if [ -f "$migration" ]; then
        echo "  - Applying $(basename $migration)"
        supabase db reset --linked
        break
    fi
done

# Get the database URL
echo "✅ Database setup complete!"
echo ""
echo "🌐 Your local database is running at:"
echo "  Database URL: http://localhost:54323"
echo "  Studio URL: http://localhost:54323"
echo ""
echo "📋 Tables created:"
echo "  - parking_reports (community reporting)"
echo "  - smart_alerts (proactive notifications)"
echo "  - vehicle_types & user_vehicles (vehicle-specific search)"
echo "  - gamification_stats & achievements (rewards system)"
echo "  - user_profiles (extended user data)"
echo "  - daily_challenges (engagement system)"
echo "  - leaderboard_entries (competition)"
echo ""
echo "🎯 Next steps:"
echo "  1. Update your .env.local with the database URLs"
echo "  2. Test the API endpoints"
echo "  3. Add some sample data"
echo ""
echo "🔗 Database URLs (add to .env.local):"
supabase status | grep -E "(API URL|anon key|service_role key)"
