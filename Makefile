.PHONY: help install dev test lint format setup migrate compile-messages run clean docker-build docker-up docker-down

help:
	@echo "Commune Blockchain - Development Commands"
	@echo "----------------------------------------"
	@echo "install        - Install dependencies"
	@echo "dev            - Run development server"
	@echo "test           - Run tests"
	@echo "lint           - Check code quality"
	@echo "format         - Format code"
	@echo "setup          - Initial project setup (database, migrations)"
	@echo "migrate        - Run database migrations"
	@echo "compile-messages - Compile translation messages"
	@echo "run            - Run production server with gunicorn"
	@echo "clean          - Clean up cached files"
	@echo "docker-build   - Build Docker images"
	@echo "docker-up      - Start Docker containers"
	@echo "docker-down    - Stop Docker containers"

install:
	@echo "📦 Installing dependencies..."
	pip install -r requirements.txt
	@echo "✅ Dependencies installed successfully!"

dev:
	@echo "🚀 Starting development server..."
	python manage.py runserver

test:
	@echo "🧪 Running tests..."
	python -m pytest

lint:
	@echo "🔍 Checking code quality..."
	flake8
	mypy .
	isort --check-only --profile black .
	@echo "✅ Code quality checks passed!"

format:
	@echo "✨ Formatting code..."
	black .
	isort --profile black .
	@echo "✅ Code formatted successfully!"

setup: install migrate compile-messages
	@echo "🔧 Setting up initial data..."
	python manage.py loaddata initial_data
	@echo "✅ Setup completed successfully!"

migrate:
	@echo "🗃️ Running database migrations..."
	python manage.py makemigrations
	python manage.py migrate
	@echo "✅ Migrations applied successfully!"

compile-messages:
	@echo "🌐 Compiling translation messages..."
	python compile_translations.py
	@echo "✅ Translation messages compiled successfully!"

run:
	@echo "🚀 Starting production server..."
	gunicorn -w 4 -b 0.0.0.0:8000 config.wsgi:application

clean:
	@echo "🧹 Cleaning up cached files..."
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.pyo" -delete
	find . -type f -name "*.pyd" -delete
	find . -type f -name ".coverage" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} +
	find . -type d -name "*.egg" -exec rm -rf {} +
	find . -type d -name ".pytest_cache" -exec rm -rf {} +
	find . -type d -name ".coverage" -exec rm -rf {} +
	find . -type d -name "htmlcov" -exec rm -rf {} +
	find . -type d -name ".mypy_cache" -exec rm -rf {} +
	@echo "✅ Cleanup completed successfully!"

docker-build:
	@echo "🐳 Building Docker images..."
	docker-compose build
	@echo "✅ Docker images built successfully!"

docker-up:
	@echo "🐳 Starting Docker containers..."
	docker-compose up -d
	@echo "✅ Docker containers started successfully!"

docker-down:
	@echo "🐳 Stopping Docker containers..."
	docker-compose down
	@echo "✅ Docker containers stopped successfully!" 