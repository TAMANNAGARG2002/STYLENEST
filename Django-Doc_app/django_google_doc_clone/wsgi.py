"""WSGI config for django_google_doc_clone project."""

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "django_google_doc_clone.settings")

application = get_wsgi_application()
