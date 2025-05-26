# Blockchain Administrative Management - Docker Deployment Script (Windows PowerShell)
# This script builds and deploys the entire application stack

Write-Host "🚀 Starting Blockchain Administrative Management Deployment..." -ForegroundColor Green

# Check if .env file exists
if (!(Test-Path "../.env")) {
    Write-Host "📄 Creating .env file from .env.example..." -ForegroundColor Yellow
    Copy-Item "../.env.example" "../.env"
    Write-Host "⚠️  Please update the .env file with your specific configuration before continuing." -ForegroundColor Yellow
    Write-Host "Press any key to continue or Ctrl+C to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

try {
    # Build and start services
    Write-Host "🔨 Building Docker images..." -ForegroundColor Blue
    docker-compose -f "../docker-compose.yml" build --no-cache
    
    Write-Host "📦 Starting services..." -ForegroundColor Blue
    docker-compose -f "../docker-compose.yml" up -d
    
    # Wait for database to be ready
    Write-Host "⏳ Waiting for database to be ready..." -ForegroundColor Yellow
    do {
        Write-Host "Waiting for PostgreSQL..." -ForegroundColor Yellow
        Start-Sleep -Seconds 2
        $dbReady = docker-compose -f "../docker-compose.yml" exec -T db pg_isready -U postgres
    } while ($LASTEXITCODE -ne 0)
    
    # Create migrations
    Write-Host "🔄 Creating database migrations..." -ForegroundColor Blue
    docker-compose -f "../docker-compose.yml" exec backend python manage.py makemigrations
    
    # Run database migrations
    Write-Host "🗄️  Running database migrations..." -ForegroundColor Blue
    docker-compose -f "../docker-compose.yml" exec backend python manage.py migrate
    
    # Collect static files
    Write-Host "📁 Collecting static files..." -ForegroundColor Blue
    docker-compose -f "../docker-compose.yml" exec backend python manage.py collectstatic --noinput
    
    # Show status
    Write-Host "📊 Checking service status..." -ForegroundColor Blue
    docker-compose -f "../docker-compose.yml" ps
    
    Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
    Write-Host "🌐 Frontend available at: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "🔧 Backend API available at: http://localhost:8000/api" -ForegroundColor Cyan
    Write-Host "🔍 Nginx load balancer available at: http://localhost:80" -ForegroundColor Cyan
    Write-Host "📊 To view logs: docker-compose logs -f [service_name]" -ForegroundColor Gray
    Write-Host "🛑 To stop services: docker-compose down" -ForegroundColor Gray
}
catch {
    Write-Host "❌ Deployment failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} 