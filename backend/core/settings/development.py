from .base import *
import os

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0', 'backend', 'frontend']

# CORS settings for development
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://frontend:3000",
]

# Add custom middleware
MIDDLEWARE += [
    'core.middleware.CsrfExemptMiddleware',
]

# Set up database for development - Use PostgreSQL for Docker
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME', 'blockchain_admin'),
        'USER': os.environ.get('DB_USER', 'postgres'),
        'PASSWORD': os.environ.get('DB_PASSWORD', 'admin123'),
        'HOST': os.environ.get('DB_HOST', 'localhost'),
        'PORT': os.environ.get('DB_PORT', '5432'),
        'OPTIONS': {
            'client_encoding': 'UTF8',
        },
    }
}

# Redis settings for development
REDIS_HOST = os.environ.get('REDIS_HOST', 'localhost')
REDIS_PORT = os.environ.get('REDIS_PORT', '6379')
REDIS_PASSWORD = os.environ.get('REDIS_PASSWORD', 'redis123')

CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': f'redis://:{REDIS_PASSWORD}@{REDIS_HOST}:{REDIS_PORT}/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}

# Email backend for development
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Additional development apps
# Uncomment if debug_toolbar is installed
# INSTALLED_APPS += [
#     'debug_toolbar',
# ]

# MIDDLEWARE += [
#     'debug_toolbar.middleware.DebugToolbarMiddleware',
# ]

# Debug toolbar settings
# INTERNAL_IPS = ['127.0.0.1']

# Turn off strong password validation for development
AUTH_PASSWORD_VALIDATORS = []

# Blockchain development settings
BLOCKCHAIN_NETWORK = 'development'
WEB3_PROVIDER_URI = 'http://localhost:8545'  # Local Ganache or similar

# Contract addresses (these would be set after deployment)
DOCUMENT_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000'
USER_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000'
ADMIN_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000'

# Contract ABI paths - use absolute paths to ensure correct loading
BLOCKCHAIN_DIR = os.path.join(os.path.dirname(BASE_DIR), 'blockchain')
CONTRACT_ABI_DIR = os.path.join(os.path.dirname(BASE_DIR), 'blockchain', 'contracts')

# Default blockchain account for sending transactions
BLOCKCHAIN_DEFAULT_ACCOUNT = '0x0000000000000000000000000000000000000000'
BLOCKCHAIN_DEFAULT_PRIVATE_KEY = None  # Should be set securely in production

# Logging for development
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
        },
    },
}
