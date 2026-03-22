from django.urls import path, include
from django.views.generic import RedirectView

urlpatterns = [
    path("", RedirectView.as_view(url="/editor/", permanent=False), name="root-redirect"),
    path("editor/", include("editor.urls")),
]
