"""ASGI config for django_google_doc_clone project."""

import os
from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "django_google_doc_clone.settings")

application = get_asgi_application()
