#!/bin/bash

# BellHisFirm-Frontend Setup Script
# This script helps you get started quickly

set -e

echo "🚀 BellHisFirm-Frontend Setup"
echo "================================"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running"
    echo "Please start Docker Desktop and try again"
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Check for JDBC driver
if [ ! -f "vkg/jdbc/postgresql-42.7.8.jar" ]; then
    echo "📦 PostgreSQL JDBC driver not found"
    echo "Downloading..."
    curl -L https://jdbc.postgresql.org/download/postgresql-42.7.8.jar \
      -o vkg/jdbc/postgresql-42.7.8.jar
    echo "✅ JDBC driver downloaded"
else
    echo "✅ JDBC driver already exists"
fi
echo ""

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template"
    cp .env.example .env
    echo "✅ .env file created"
    echo "⚠️  Remember to change the password in .env for production!"
else
    echo "✅ .env file already exists"
fi
echo ""

# Start services
echo "🐳 Starting Docker Compose services..."
docker compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check service health
echo ""
echo "📊 Service Status:"
docker compose ps
echo ""

echo "✅ Setup complete!"
echo ""
echo "🌐 Access your services:"
echo "   • Sampo UI:        http://localhost:3000"
echo "   • Ontop SPARQL:    http://localhost:8080"
echo "   • PostgreSQL:      localhost:5432"
echo ""
echo "📚 Next steps:"
echo "   1. Check the logs: docker compose logs -f"
echo "   2. Configure your ontology in vkg/input/"
echo "   3. Add your Sampo UI application to sampo/"
echo ""
