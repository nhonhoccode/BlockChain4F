#!/bin/bash

# Blockchain Administrative Management - Docker Deployment Script
# This script builds and deploys the entire application stack

set -e

echo "🚀 Starting Blockchain Administrative Management Deployment..."

# Check if .env file exists
if [ ! -f "../.env" ]; then
    echo "📄 Creating .env file from .env.example..."
    cp "../.env.example" "../.env"
    echo "⚠️  Please update the .env file with your specific configuration before continuing."
    echo "Press any key to continue or Ctrl+C to exit..."
    read -n 1 -s
fi

# Build and start services
echo "🔨 Building Docker images..."
docker-compose -f "../docker-compose.yml" build --no-cache

echo "📦 Starting services..."
docker-compose -f "../docker-compose.yml" up -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
until docker-compose -f "../docker-compose.yml" exec -T db pg_isready -U postgres; do
    echo "Waiting for PostgreSQL..."
    sleep 2
done

# Create migrations
echo "🔄 Creating database migrations..."
docker-compose -f "../docker-compose.yml" exec backend python manage.py makemigrations

# Run database migrations
echo "🗄️  Running database migrations..."
docker-compose -f "../docker-compose.yml" exec backend python manage.py migrate

# Collect static files
echo "📁 Collecting static files..."
docker-compose -f "../docker-compose.yml" exec backend python manage.py collectstatic --noinput

# Show status
echo "📊 Checking service status..."
docker-compose -f "../docker-compose.yml" ps

echo "✅ Deployment completed successfully!"
echo "🌐 Frontend available at: http://localhost:3000"
echo "🔧 Backend API available at: http://localhost:8000/api"
echo "🔍 Nginx load balancer available at: http://localhost:80"
echo "📊 To view logs: docker-compose logs -f [service_name]"
echo "🛑 To stop services: docker-compose down" 