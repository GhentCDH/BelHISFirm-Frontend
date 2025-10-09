.PHONY: help setup up down restart logs clean reset dev prod

# Default target
help:
	@echo "BellHisFirm-Frontend - Available Commands"
	@echo "=========================================="
	@echo ""
	@echo "  make setup      - Initial setup (download JDBC, create .env)"
	@echo "  make up         - Start all services"
	@echo "  make down       - Stop all services"
	@echo "  make restart    - Restart all services"
	@echo "  make logs       - View logs (all services)"
	@echo "  make clean      - Stop and remove containers"
	@echo "  make reset      - Clean everything including volumes (⚠️  DATA LOSS)"
	@echo "  make dev        - Start in development mode"
	@echo "  make prod       - Start in production mode"
	@echo ""
	@echo "Service-specific:"
	@echo "  make logs-db    - View database logs"
	@echo "  make logs-vkg   - View VKG logs"
	@echo "  make logs-sampo - View Sampo UI logs"
	@echo "  make logs-seeder - View data seeder logs"
	@echo "  make shell-db   - Connect to database"
	@echo ""
	@echo "Data Seeding:"
	@echo "  make seed-small  - Seed 100 companies, 200 persons (~1s)"
	@echo "  make seed-medium - Seed 10k companies, 20k persons (~45s)"
	@echo "  make seed-large  - Seed 50k companies, 100k persons (~4min)"
	@echo "  make seed-xl     - Seed 100k companies, 200k persons (~8min)"
	@echo "  make seed-custom - Seed with custom SEED_* env vars"
	@echo ""

# Initial setup
setup:
	@echo "🚀 Running initial setup..."
	@bash setup.sh

# Start services
up:
	@echo "▶️  Starting services..."
	@docker compose up -d
	@echo "✅ Services started!"
	@make status

# Stop services
down:
	@echo "⏸️  Stopping services..."
	@docker compose down
	@echo "✅ Services stopped"

# Restart services
restart:
	@echo "🔄 Restarting services..."
	@docker compose restart
	@echo "✅ Services restarted"

# View logs
logs:
	@docker compose logs -f

logs-db:
	@docker compose logs -f db

logs-vkg:
	@docker compose logs -f vkg

logs-sampo:
	@docker compose logs -f sampo

# Status
status:
	@echo "📊 Service Status:"
	@docker compose ps

# Clean (remove containers)
clean:
	@echo "🧹 Cleaning up containers..."
	@docker compose down
	@echo "✅ Cleanup complete"

# Reset everything (including volumes)
reset:
	@echo "⚠️  WARNING: This will delete all data!"
	@read -p "Are you sure? (yes/no): " confirm && \
	if [ "$$confirm" = "yes" ]; then \
		docker compose down -v; \
		echo "✅ Reset complete"; \
	else \
		echo "❌ Reset cancelled"; \
	fi

# Development mode
dev:
	@echo "🔧 Starting in development mode..."
	@docker compose -f compose.yml -f compose.dev.yml up -d
	@echo "✅ Development mode started"

# Production mode
prod:
	@echo "🚀 Starting in production mode..."
	@docker compose -f compose.yml -f compose.prod.yml up -d
	@echo "✅ Production mode started"

# Database shell
shell-db:
	@docker compose exec db psql -U belhisfirm_user -d belhisfirm

# Build services
build:
	@echo "🔨 Building services..."
	@docker compose build
	@echo "✅ Build complete"

# Pull latest images
pull:
	@echo "📥 Pulling latest images..."
	@docker compose pull
	@echo "✅ Pull complete"

# Show URLs
urls:
	@echo "🌐 Service URLs:"
	@echo "  Sampo UI:     http://localhost:3000"
	@echo "  Ontop SPARQL: http://localhost:8080"
	@echo "  PostgreSQL:   localhost:5432"


# Data Seeder commands
logs-seeder:
	@docker compose logs -f dataseeder

seed-small:
	@echo "🌱 Seeding with small dataset (100 companies, 200 persons)..."
	@SEED_COMPANIES=100 SEED_PERSONS=200 docker compose up dataseeder

seed-medium:
	@echo "🌱 Seeding with medium dataset (10k companies, 20k persons)..."
	@SEED_COMPANIES=10000 SEED_PERSONS=20000 SEED_BATCH_SIZE=2000 docker compose up dataseeder

seed-large:
	@echo "🌱 Seeding with large dataset (50k companies, 100k persons)..."
	@SEED_COMPANIES=50000 SEED_PERSONS=100000 SEED_BATCH_SIZE=5000 docker compose up dataseeder

seed-xl:
	@echo "🌱 Seeding with XL dataset (100k companies, 200k persons)..."
	@SEED_COMPANIES=100000 SEED_PERSONS=200000 SEED_BATCH_SIZE=5000 docker compose up dataseeder

seed-custom:
	@echo "🌱 Seeding with custom parameters..."
	@echo "Set SEED_COMPANIES, SEED_PERSONS, SEED_BATCH_SIZE environment variables"
	@docker compose up dataseeder


# Clear seeded data (keeps sample data)
clear-seeded:
	@echo "🗑️  Clearing seeded data (keeping sample data with ID ≤ 100)..."
	@docker compose exec db psql -U belhisfirm_user -d belhisfirm -c \
		"DELETE FROM company_person WHERE id >= 1001; \
		 DELETE FROM persons WHERE id >= 1001; \
		 DELETE FROM companies WHERE id >= 1001;"
	@echo "✅ Cleared seeded data"
