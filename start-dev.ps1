param(
    [string]$Command = "start"
)

Write-Host "Starting Blockchain Administrative Management System - Development Mode" -ForegroundColor Green
Write-Host "==================================================================" -ForegroundColor Green

function Check-Docker {
    try {
        docker info | Out-Null
        Write-Host "Docker is running" -ForegroundColor Green
    }
    catch {
        Write-Host "Docker is not running. Please start Docker first." -ForegroundColor Red
        exit 1
    }
}

function Cleanup {
    Write-Host "Cleaning up old containers..." -ForegroundColor Yellow
    docker-compose -f docker-compose.dev.yml down -v
    docker system prune -f
}

function Start-Services {
    Write-Host "Building and starting services..." -ForegroundColor Yellow
    docker-compose -f docker-compose.dev.yml up --build -d
}

function Show-Logs {
    Write-Host "Showing service logs..." -ForegroundColor Yellow
    docker-compose -f docker-compose.dev.yml logs -f
}

function Check-Services {
    Write-Host "Checking service status..." -ForegroundColor Yellow
    docker-compose -f docker-compose.dev.yml ps
}

switch ($Command.ToLower()) {
    "start" {
        Check-Docker
        Start-Services
        Start-Sleep -Seconds 10
        Check-Services
        Write-Host ""
        Write-Host "Development environment is starting up!" -ForegroundColor Green
        Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
        Write-Host "Backend API: http://localhost:8000" -ForegroundColor Cyan
        Write-Host "Database: PostgreSQL on localhost:5432" -ForegroundColor Cyan
        Write-Host "Redis: localhost:6379" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "To view logs: .\start-dev.ps1 logs" -ForegroundColor White
        Write-Host "To stop: .\start-dev.ps1 stop" -ForegroundColor White
    }
    "stop" {
        Write-Host "Stopping development environment..." -ForegroundColor Red
        docker-compose -f docker-compose.dev.yml down
    }
    "restart" {
        Write-Host "Restarting development environment..." -ForegroundColor Yellow
        docker-compose -f docker-compose.dev.yml down
        docker-compose -f docker-compose.dev.yml up -d
    }
    "build" {
        Write-Host "Rebuilding development environment..." -ForegroundColor Yellow
        docker-compose -f docker-compose.dev.yml build --no-cache
    }
    "logs" {
        Show-Logs
    }
    "status" {
        Check-Services
    }
    "cleanup" {
        Cleanup
    }
    "shell-backend" {
        Write-Host "Opening backend shell..." -ForegroundColor Yellow
        docker-compose -f docker-compose.dev.yml exec backend bash
    }
    "shell-db" {
        Write-Host "Opening database shell..." -ForegroundColor Yellow
        docker-compose -f docker-compose.dev.yml exec db psql -U postgres -d blockchain_admin
    }
    default {
        Write-Host "Usage: .\start-dev.ps1 [command]" -ForegroundColor White
        Write-Host ""
        Write-Host "Commands:" -ForegroundColor White
        Write-Host "  start        - Start development environment (default)" -ForegroundColor Gray
        Write-Host "  stop         - Stop all containers" -ForegroundColor Gray
        Write-Host "  restart      - Restart all containers" -ForegroundColor Gray
        Write-Host "  build        - Rebuild all containers" -ForegroundColor Gray
        Write-Host "  logs         - Show service logs" -ForegroundColor Gray
        Write-Host "  status       - Show service status" -ForegroundColor Gray
        Write-Host "  cleanup      - Remove all containers and volumes" -ForegroundColor Gray
        Write-Host "  shell-backend - Open backend container shell" -ForegroundColor Gray
        Write-Host "  shell-db     - Open database shell" -ForegroundColor Gray
        exit 1
    }
} 