from .base import *
import os

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0']

# CORS settings for development
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Add custom middleware
MIDDLEWARE += [
    'core.middleware.CsrfExemptMiddleware',
]

# Use SQLite for local development
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Simple cache for local development
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
    }
}

# Email backend for development
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

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

# Static files for local development
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media') 