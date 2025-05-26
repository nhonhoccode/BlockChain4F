# Backend Dockerfile for Django Application
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=core.settings.prod
ENV PIP_DISABLE_PIP_VERSION_CHECK=1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        postgresql-client \
        build-essential \
        libpq-dev \
        curl \
        git \
        gcc \
        g++ \
        make \
        python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements/ requirements/
# Cài đặt các dependencies theo thứ tự để tránh xung đột
RUN pip install --no-cache-dir --upgrade pip setuptools wheel \
    && pip install --no-cache-dir cython \
    && pip install --no-cache-dir -r requirements/base.txt \
    && pip install --no-cache-dir -r requirements/prod.txt

# Copy project
COPY . .

# Create necessary directories
RUN mkdir -p media static logs

# Create non-root user
RUN adduser --disabled-password --gecos '' appuser \
    && chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/api/health/ || exit 1

# Run the application
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "--timeout", "120", "core.wsgi:application"] 