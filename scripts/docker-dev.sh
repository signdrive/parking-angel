#!/bin/bash

# Development Docker setup with hot reload

echo "🔥 Starting Parking Angel in development mode..."

# Build development image
docker-compose -f docker-compose.yml -f docker-compose.dev.yml build

# Start with volume mounts for hot reload
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

echo "🚀 Development environment ready!"
echo "🌐 Application: http://localhost:3000"
echo "🔄 Hot reload enabled - changes will be reflected automatically"
