from django.shortcuts import render


def index(request):
    """Render the main editor page.

    This view serves a single-page rich text editor. All editing logic is client-side.
    """
    return render(request, "editor/index.html")
