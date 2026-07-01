#!/bin/bash
set -e

echo "🚀 Setting up Mythos AI Security Platform..."

# Check dependencies
command -v docker >/dev/null 2>&1 || { echo "Docker is required but not installed."; exit 1; }
command -v docker-compose >/dev/null 2>&1 || command -v docker >/dev/null 2>&1 || { echo "Docker Compose is required"; exit 1; }

# Copy env files
if [ ! -f .env ]; then
  cp .env.example .env
  echo "✅ Created .env from .env.example - please update with your values"
fi

# Build and start services
echo "🏗️  Building Docker images..."
docker compose build

echo "🗄️  Starting database services..."
docker compose up -d postgres redis

echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

echo "🚀 Starting all services..."
docker compose up -d

echo "✅ Mythos AI Security Platform is running!"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8080/api"
echo "   AI Service: http://localhost:8001"
echo ""
echo "   Default credentials: admin@mythos.ai / Admin@123!"
