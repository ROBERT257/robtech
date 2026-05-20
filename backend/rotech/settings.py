"""
Django settings for rotech project.
"""

from pathlib import Path
from decouple import config

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = config('SECRET_KEY', default='django-insecure-change-this-in-production')

DEBUG = config('DEBUG', default=True, cast=bool)

_allowed_hosts = config('ALLOWED_HOSTS', default='localhost,127.0.0.1', cast=lambda v: [s.strip() for s in v.split(',')])
ALLOWED_HOSTS = list(dict.fromkeys(_allowed_hosts + ['10.0.2.2']))

INSTALLED_APPS = [
    'jazzmin',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'accounts',
    'payments',
    'referrals',
    'claims',
    'wallet',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'rotech.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
            'libraries': {
                'admin_metrics': 'accounts.templatetags.admin_metrics',
            },
        },
    },
]

WSGI_APPLICATION = 'rotech.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

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

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'Africa/Nairobi'

USE_I18N = True

USE_TZ = True

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [BASE_DIR / 'static']

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Custom User Model
AUTH_USER_MODEL = 'accounts.User'

# REST Framework settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}

# JWT Settings
from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=24),  # 24 hours
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),  # 7 days
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# CORS settings
CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='http://localhost:19000,exp://127.0.0.1:19000,http://localhost:8081,exp://127.0.0.1:8081',
    cast=lambda v: [s.strip() for s in v.split(',')]
)
CORS_ALLOW_CREDENTIALS = True

# M-Pesa Daraja API Settings
MPESA_CONSUMER_KEY = config('MPESA_CONSUMER_KEY', default='')
MPESA_CONSUMER_SECRET = config('MPESA_CONSUMER_SECRET', default='')
MPESA_PASSKEY = config('MPESA_PASSKEY', default='')
MPESA_SHORTCODE = config('MPESA_SHORTCODE', default='')
MPESA_ENVIRONMENT = config('MPESA_ENVIRONMENT', default='sandbox')  # sandbox or production

# Registration fee (enforced server-side for onboarding)
REGISTRATION_FEE = config('REGISTRATION_FEE', default=300, cast=int)  # KSH

# Optional credit to apply to wallet after successful registration (0 to disable)
REGISTRATION_CREDIT = config('REGISTRATION_CREDIT', default=0, cast=int)

# M-Pesa callback / security
# Optional comma-separated list of IPs to accept callbacks from (safelist)
MPESA_CALLBACK_IPS = config('MPESA_CALLBACK_IPS', default='', cast=lambda v: [s.strip() for s in v.split(',') if s.strip()])
# Maximum number of STK push attempts before failing
MPESA_MAX_RETRIES = config('MPESA_MAX_RETRIES', default=3, cast=int)
# STK push request timeout (minutes)
MPESA_REQUEST_TIMEOUT_MINUTES = config('MPESA_REQUEST_TIMEOUT_MINUTES', default=10, cast=int)
MPESA_CALLBACK_URL = config('MPESA_CALLBACK_URL', default='')

# Rate limiting for payment initiation
MPESA_RATE_LIMIT_SECONDS = config('MPESA_RATE_LIMIT_SECONDS', default=30, cast=int)
MPESA_RATE_LIMIT_DAILY = config('MPESA_RATE_LIMIT_DAILY', default=20, cast=int)

# Callback HMAC secret for verifying callbacks (set in env)
MPESA_CALLBACK_SECRET = config('MPESA_CALLBACK_SECRET', default='')

# Referral reward
REFERRAL_REWARD = 150  # RT tokens

JAZZMIN_SETTINGS = {
    'site_title': 'Rotech Admin',
    'site_header': 'Rotech Control Center',
    'site_brand': 'Rotech',
    'site_logo': 'brand/logo.svg',
    'site_logo_classes': 'img-circle',
    'site_icon': 'brand/favicon.svg',
    'welcome_sign': 'Welcome to Rotech Admin Dashboard',
    'copyright': 'Rotech',
    'show_sidebar': True,
    'navigation_expanded': True,
    'order_with_respect_to': [
        'accounts',
        'wallet',
        'claims',
        'payments',
        'referrals',
    ],
    'icons': {
        'accounts': 'fas fa-users-cog',
        'accounts.User': 'fas fa-user-shield',
        'wallet': 'fas fa-wallet',
        'wallet.Transaction': 'fas fa-exchange-alt',
        'wallet.Payment': 'fas fa-credit-card',
        'wallet.Claim': 'fas fa-gift',
        'claims': 'fas fa-coins',
        'claims.Claim': 'fas fa-hand-holding-usd',
        'payments': 'fas fa-money-check-alt',
        'payments.Payment': 'fas fa-receipt',
        'payments.MpesaCallback': 'fas fa-broadcast-tower',
        'referrals': 'fas fa-user-friends',
        'referrals.Referral': 'fas fa-share-alt',
    },
    'custom_css': 'brand/admin.css',
    'show_ui_builder': False,
}

JAZZMIN_UI_TWEAKS = {
    'theme': 'darkly',
    'dark_mode_theme': 'darkly',
    'navbar': 'navbar-dark bg-primary',
    'sidebar': 'sidebar-dark-primary',
    'accent': 'accent-info',
    'brand_colour': 'navbar-primary',
    'button_classes': {
        'primary': 'btn btn-info',
        'secondary': 'btn btn-outline-secondary',
        'info': 'btn btn-outline-info',
        'warning': 'btn btn-outline-warning',
        'danger': 'btn btn-danger',
        'success': 'btn btn-success',
    },
}
