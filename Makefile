# Makefile for Docker operations

.PHONY: build up down logs restart clean health dev prod

# Build the Docker images
build:
	docker-compose build

# Start all services
up:
	docker-compose up -d

# Stop all services
down:
	docker-compose down

# View logs
logs:
	docker-compose logs -f

# View app logs only
logs-app:
	docker-compose logs -f parking-angel

# Restart the application
restart:
	docker-compose restart parking-angel

# Clean up Docker resources
clean:
	docker-compose down -v
	docker system prune -f

# Check application health
health:
	curl -f http://localhost:3000/api/health

# Development mode
dev:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Production mode
prod:
	docker-compose -f docker-compose.yml up -d

# Setup environment
setup:
	chmod +x scripts/docker-setup.sh
	./scripts/docker-setup.sh

# View container status
status:
	docker-compose ps

# Enter app container shell
shell:
	docker-compose exec parking-angel sh

# Database operations
db-migrate:
	docker-compose exec parking-angel npm run db:migrate

db-seed:
	docker-compose exec parking-angel npm run db:seed
