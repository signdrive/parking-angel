#!/bin/bash

# Docker setup script for Parking Angel

echo "🚀 Setting up Parking Angel with Docker..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.docker.example .env
    echo "⚠️  Please edit .env file with your actual environment variables"
    echo "📖 Refer to .env.docker.example for required variables"
fi

# Build and start the application
echo "🔨 Building Docker images..."
docker-compose build

echo "🚀 Starting services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check health
echo "🔍 Checking application health..."
curl -f http://localhost:3000/api/health || echo "⚠️  Health check failed - services may still be starting"

echo "✅ Setup complete!"
echo ""
echo "🌐 Application: http://localhost:3000"
echo "📊 Health Check: http://localhost:3000/api/health"
echo ""
echo "📋 Useful commands:"
echo "  docker-compose logs -f parking-angel  # View app logs"
echo "  docker-compose logs -f redis          # View Redis logs"
echo "  docker-compose down                   # Stop all services"
echo "  docker-compose up -d                  # Start all services"
echo "  docker-compose restart parking-angel  # Restart app only"
