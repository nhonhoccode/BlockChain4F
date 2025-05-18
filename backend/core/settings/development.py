from .base import *

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0']

# CORS settings for development
CORS_ALLOW_ALL_ORIGINS = True

# Set up database for development
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
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
BLOCKCHAIN_ENDPOINT = 'http://localhost:8545'  # Local Ganache or similar
