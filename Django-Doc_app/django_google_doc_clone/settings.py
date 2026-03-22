from pathlib import Path

# Base directory
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = "django-insecure-change-me"

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ["127.0.0.1", "localhost"]

# Application definition
INSTALLED_APPS = [
    "django.contrib.staticfiles",
    "editor",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "django_google_doc_clone.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "django_google_doc_clone" / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.template.context_processors.static",
            ],
        },
    },
]

WSGI_APPLICATION = "django_google_doc_clone.wsgi.application"
ASGI_APPLICATION = "django_google_doc_clone.asgi.application"

# Database (unused by this project beyond Django defaults)
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

# Internationalization
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = "/static/"

# Default primary key field type
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
