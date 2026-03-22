# Simple Docs Clone — Django Beginner Project

A beginner-friendly Django project that serves a single-page, offline-capable text editor similar to Google Docs. The editor is powered by Quill.js and saves everything to your browser's localStorage. No database is used for documents.

## Features
- Rich-text editor (bold, italic, underline, strikethrough, headings, size, color, lists, blockquote, code, links, images, undo/redo)
- Editable document title
- Autosave to localStorage every 5 seconds and on blur/unload
- File operations: New, Import (HTML/JSON), Save HTML, Export Markdown, Export PDF, Clear Local Data
- Live word and character count
- Responsive, clean UI similar to Google Docs
- Light/Dark theme with persistence
- Optional version snapshots (keeps 3 previous saves) with restore

## Tech Stack
- Python 3.11
- Django 4.2
- SQLite (default, unused)
- HTML5, CSS3, JavaScript (ES6)
- Frontend via CDN: Quill.js, Turndown.js, html2pdf.js, FontAwesome, Google Fonts (Inter)

## Project Structure
```
django_google_doc_clone/
├─ manage.py
├─ requirements.txt
├─ README.md
├─ LICENSE
├─ django_google_doc_clone/
│  ├─ __init__.py
│  ├─ settings.py
│  ├─ urls.py
│  ├─ wsgi.py
│  └─ asgi.py
└─ editor/
   ├─ __init__.py
   ├─ views.py
   ├─ urls.py
   ├─ templates/
   │  └─ editor/
   │     └─ index.html
   └─ static/
      └─ editor/
         ├─ css/
         │  └─ styles.css
         ├─ js/
         │  └─ app.js
         └─ favicon.svg
```

## Setup

Linux/macOS (bash):
```
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python manage.py runserver
```

Windows (PowerShell):
```
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py runserver
```

Open the app at: http://127.0.0.1:8000/

## Using the Editor
- Title: Click the title at the top to edit.
- Toolbar: Use the toolbar for formatting (bold, italic, etc.).
- Autosave: Content and title autosave every 5 seconds and on leaving the page.
- New: Clears the current document (keeps theme and snapshots).
- Import: Load an HTML or JSON file. JSON can be a raw Quill Delta or an object with `{ delta, title }`.
- Save HTML: Downloads a self-contained HTML file with embedded styles.
- Export Markdown: Converts the current document to .md using Turndown.
- Export PDF: Creates a PDF via html2pdf.js.
- Clear Local Data: Removes saved content, title, and snapshots from localStorage.
- Versions: Keeps the last 3 autosave snapshots. Select one and Restore.

## Deployment
- Render or PythonAnywhere: Deploy this Django app as usual. Since all logic is client-side, no DB setup is required beyond Django defaults.
- GitHub Pages: The editor is a static page at `editor/templates/editor/index.html` using static assets at `editor/static/editor/`. You can host it as a pure static site by copying `index.html` and the `static/editor` folder to a static hosting location and replacing `{% load static %}` and `{% static ... %}` with plain relative paths.

## Contributing
Contributions are welcome! Please fork the repo, create a feature branch, and open a pull request. Beginner-friendly issues are encouraged for Hacktoberfest.

## License
MIT License — see LICENSE for details.
