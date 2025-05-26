import os
import environ
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Initialize environment variables
env = environ.Env(
    # Set casting and default values
    DEBUG=(bool, False),
    GOOGLE_CLIENT_ID=(str, ''),
    GOOGLE_CLIENT_SECRET=(str, ''),
)

# Take environment variables from .env file
environ.Env.read_env(BASE_DIR.parent / '.env')

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-1234567890abcdefghijklmnopqrstuvwxyz'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = []

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party apps
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    
    # Project apps
    'apps.accounts',
    'apps.administrative',
    'apps.officer_management',
    'apps.blockchain',
    'apps.notifications',
    'apps.feedback',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'core.middleware.CitizenAccessMiddleware',
    'core.middleware.OfficerAccessMiddleware',
    'core.middleware.ChairmanAccessMiddleware',
    'core.middleware.PermissionOverrideMiddleware',
    'core.middleware.CsrfExemptMiddleware',
    'utils.middleware.MultiRoleMiddleware',
]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'vi'
TIME_ZONE = 'Asia/Ho_Chi_Minh'
USE_I18N = True
USE_L10N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'static')
STATICFILES_DIRS = []

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# File upload settings
FILE_UPLOAD_PERMISSIONS = 0o644
FILE_UPLOAD_HANDLERS = [
    'django.core.files.uploadhandler.MemoryFileUploadHandler',
    'django.core.files.uploadhandler.TemporaryFileUploadHandler',
]
FILE_UPLOAD_MAX_MEMORY_SIZE = 5242880  # 5 MB

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# REST Framework settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
}

# CORS settings
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
    'access-control-allow-origin',
    'cross-origin-opener-policy',
    'cross-origin-resource-policy',
]

# CSRF settings for API
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]
CSRF_COOKIE_HTTPONLY = False
CSRF_COOKIE_SAMESITE = 'Lax'

# Thêm các header CORS đặc biệt để giải quyết lỗi Cross-Origin-Opener-Policy
CORS_EXPOSE_HEADERS = [
    'Content-Type', 
    'X-CSRFToken',
    'Cross-Origin-Opener-Policy',
    'Cross-Origin-Resource-Policy',
]
CORS_PREFLIGHT_MAX_AGE = 86400  # 24 giờ

# Cấu hình đặc biệt cho Cross-Origin-Opener-Policy để cho phép popup
SECURE_CROSS_ORIGIN_OPENER_POLICY = 'same-origin-allow-popups'
SECURE_CROSS_ORIGIN_EMBEDDER_POLICY = None

# Google OAuth settings
GOOGLE_CLIENT_ID = env('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET = env('GOOGLE_CLIENT_SECRET')
GOOGLE_REDIRECT_URI = "http://localhost:3000/auth/google/callback"
GOOGLE_OAUTH_REDIRECT_URIS = [
    "http://localhost:3000",
    "http://localhost:3000/auth/login",
    "http://localhost:3000/auth/register",
    "http://localhost:3000/auth/oauth-callback",
    "http://localhost:3000/auth/google/callback",  # Thêm URI mới từ file JSON
    "http://localhost:8000/api/auth/google-auth/",
    "http://localhost:8000/api/auth/google-register/",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3000/auth/login",
    "http://127.0.0.1:3000/auth/register",
    "http://127.0.0.1:3000/auth/oauth-callback",
    "https://accounts.google.com/o/oauth2/auth",
    "https://accounts.google.com/o/oauth2/token",
    "https://accounts.google.com/gsi/authjs",
    "https://oauth2.googleapis.com/token",
    "postmessage",  # Cho phép postMessage flow trong Google OAuth
    "http://localhost",
    "http://localhost:3000/",
    # Thêm các URI sau để tránh lỗi redirect_uri_mismatch
    "urn:ietf:wg:oauth:2.0:oob",
    "urn:ietf:wg:oauth:2.0:oob:auto",
    "http://localhost:3000/#/auth/login",
    "http://localhost:3000/#/auth/register"
]

# Custom user model
AUTH_USER_MODEL = 'accounts.User'
