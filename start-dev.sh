#!/bin/bash

echo "🚀 Starting Blockchain Administrative Management System - Development Mode"
echo "=================================================================="

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo "❌ Docker is not running. Please start Docker first."
        exit 1
    fi
    echo "✅ Docker is running"
}

# Function to clean up old containers
cleanup() {
    echo "🧹 Cleaning up old containers..."
    docker-compose -f docker-compose.dev.yml down -v
    docker system prune -f
}

# Function to build and start services
start_services() {
    echo "🔨 Building and starting services..."
    docker-compose -f docker-compose.dev.yml up --build -d
}

# Function to show logs
show_logs() {
    echo "📋 Showing service logs..."
    docker-compose -f docker-compose.dev.yml logs -f
}

# Function to check service status
check_services() {
    echo "🔍 Checking service status..."
    docker-compose -f docker-compose.dev.yml ps
}

# Main execution
case "${1:-start}" in
    "start")
        check_docker
        start_services
        sleep 10
        check_services
        echo ""
        echo "🎉 Development environment is starting up!"
        echo "Frontend: http://localhost:3000"
        echo "Backend API: http://localhost:8000"
        echo "Database: PostgreSQL on localhost:5432"
        echo "Redis: localhost:6379"
        echo ""
        echo "To view logs: ./start-dev.sh logs"
        echo "To stop: ./start-dev.sh stop"
        ;;
    "stop")
        echo "🛑 Stopping development environment..."
        docker-compose -f docker-compose.dev.yml down
        ;;
    "restart")
        echo "🔄 Restarting development environment..."
        docker-compose -f docker-compose.dev.yml down
        docker-compose -f docker-compose.dev.yml up -d
        ;;
    "build")
        echo "🔨 Rebuilding development environment..."
        docker-compose -f docker-compose.dev.yml build --no-cache
        ;;
    "logs")
        show_logs
        ;;
    "status")
        check_services
        ;;
    "cleanup")
        cleanup
        ;;
    "shell-backend")
        echo "🐚 Opening backend shell..."
        docker-compose -f docker-compose.dev.yml exec backend bash
        ;;
    "shell-db")
        echo "🐚 Opening database shell..."
        docker-compose -f docker-compose.dev.yml exec db psql -U postgres -d blockchain_admin
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|build|logs|status|cleanup|shell-backend|shell-db}"
        echo ""
        echo "Commands:"
        echo "  start        - Start development environment (default)"
        echo "  stop         - Stop all containers"
        echo "  restart      - Restart all containers"
        echo "  build        - Rebuild all containers"
        echo "  logs         - Show service logs"
        echo "  status       - Show service status"
        echo "  cleanup      - Remove all containers and volumes"
        echo "  shell-backend - Open backend container shell"
        echo "  shell-db     - Open database shell"
        exit 1
        ;;
esac 