#!/usr/bin/env pwsh
# Local development server runner for Django with SQLite

param(
    [string]$Command = "runserver"
)

Write-Host "Starting Django Local Development Server" -ForegroundColor Green
Write-Host "Using SQLite database (no PostgreSQL needed)" -ForegroundColor Yellow

# Set environment variable for local settings
$env:DJANGO_SETTINGS_MODULE = "core.settings.local"

# Change to backend directory
$BackendDir = Join-Path $PSScriptRoot "backend"
if (Test-Path $BackendDir) {
    Set-Location $BackendDir
    Write-Host "Changed to backend directory: $BackendDir" -ForegroundColor Blue
} else {
    Write-Host "Backend directory not found: $BackendDir" -ForegroundColor Red
    exit 1
}

try {
    switch ($Command.ToLower()) {
        "setup" {
            Write-Host "Setting up local development environment..." -ForegroundColor Cyan
            Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
            
            # Install dependencies
            if (Test-Path "requirements/base.txt") {
                python -m pip install -r requirements/base.txt
            } elseif (Test-Path "../requirements/local.txt") {
                python -m pip install -r ../requirements/local.txt
            } else {
                Write-Host "No requirements file found, skipping dependency installation" -ForegroundColor Yellow
            }
            
            Write-Host "Creating SQLite database..." -ForegroundColor Yellow
            python manage.py makemigrations
            python manage.py migrate
            
            Write-Host "Creating superuser..." -ForegroundColor Yellow
            Write-Host "Username: admin" -ForegroundColor Gray
            Write-Host "Email: admin@example.com" -ForegroundColor Gray
            Write-Host "Password: admin123" -ForegroundColor Gray
            
            $env:DJANGO_SUPERUSER_USERNAME = "admin"
            $env:DJANGO_SUPERUSER_EMAIL = "admin@example.com"
            $env:DJANGO_SUPERUSER_PASSWORD = "admin123"
            python manage.py createsuperuser --noinput
            
            Write-Host "Local setup completed!" -ForegroundColor Green
        }
        "migrate" {
            Write-Host "Running database migrations..." -ForegroundColor Cyan
            python manage.py makemigrations
            python manage.py migrate
        }
        "shell" {
            Write-Host "Starting Django shell..." -ForegroundColor Cyan
            python manage.py shell
        }
        "collectstatic" {
            Write-Host "Collecting static files..." -ForegroundColor Cyan
            python manage.py collectstatic --noinput
        }
        "runserver" {
            Write-Host "Starting Django development server..." -ForegroundColor Cyan
            Write-Host "Server will be available at: http://localhost:8000" -ForegroundColor Green
            Write-Host "Admin panel: http://localhost:8000/admin" -ForegroundColor Green
            Write-Host "API docs: http://localhost:8000/api/docs/" -ForegroundColor Green
            Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
            Write-Host ""
            
            python manage.py runserver 0.0.0.0:8000
        }
        default {
            Write-Host "Available commands:" -ForegroundColor Yellow
            Write-Host "setup      - Install dependencies and setup database" -ForegroundColor Gray
            Write-Host "runserver  - Start development server (default)" -ForegroundColor Gray
            Write-Host "migrate    - Run database migrations" -ForegroundColor Gray
            Write-Host "shell      - Start Django shell" -ForegroundColor Gray
            Write-Host "collectstatic - Collect static files" -ForegroundColor Gray
            Write-Host ""
            Write-Host "Usage: .\run-local.ps1 [command]" -ForegroundColor Blue
        }
    }
} catch {
    Write-Host "Error occurred: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} finally {
    # Reset location
    Set-Location $PSScriptRoot
} 