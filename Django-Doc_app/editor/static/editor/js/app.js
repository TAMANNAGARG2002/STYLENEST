// Simple Google Docs Clone front-end logic
// All document data is kept in the browser via localStorage.

(function () {
  const STORAGE = {
    title: 'ggdoc:title',
    delta: 'ggdoc:delta',
    html: 'ggdoc:html',
    theme: 'ggdoc:theme',
    snapshots: 'ggdoc:snapshots'
  };

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  const titleEl = $('#doc-title');
  const fileInput = $('#file-input');
  const wordCountEl = $('#word-count');
  const charCountEl = $('#char-count');
  const saveIndicatorEl = $('#save-indicator');
  const versionSelectEl = $('#version-select');

  const btnNew = $('#btn-new');
  const btnImport = $('#btn-import');
  const btnSaveHtml = $('#btn-save-html');
  const btnExportMd = $('#btn-export-md');
  const btnExportPdf = $('#btn-export-pdf');
  const btnClear = $('#btn-clear');
  const btnRestore = $('#btn-restore');
  const btnUndo = $('#btn-undo');
  const btnRedo = $('#btn-redo');
  const themeToggle = $('#theme-toggle');

  // Theme handling
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const meta = $('#meta-theme-color');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0b1320' : '#ffffff');
  }
  function initTheme() {
    const saved = localStorage.getItem(STORAGE.theme);
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'light');
    applyTheme(theme);
  }
  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'light' ? 'dark' : 'light';
    localStorage.setItem(STORAGE.theme, next);
    applyTheme(next);
  }

  // Initialize Quill editor
  let quill;
  function initEditor() {
    quill = new Quill('#editor', {
      theme: 'snow',
      modules: {
        toolbar: '#toolbar',
        history: { delay: 1000, maxStack: 500, userOnly: true }
      }
    });

    // Undo/Redo buttons
    btnUndo.addEventListener('click', () => quill.history.undo());
    btnRedo.addEventListener('click', () => quill.history.redo());

    // Update counts on change
    quill.on('text-change', updateCounts);
  }

  // Word/char counts
  function updateCounts() {
    const text = quill.getText() || '';
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const chars = trimmed.replace(/\s/g, '').length;
    wordCountEl.textContent = words.toString();
    charCountEl.textContent = chars.toString();
  }

  // Save indicator
  function updateSaveIndicator() {
    const dt = new Date();
    const hh = String(dt.getHours()).padStart(2, '0');
    const mm = String(dt.getMinutes()).padStart(2, '0');
    const ss = String(dt.getSeconds()).padStart(2, '0');
    saveIndicatorEl.textContent = `Saved ${hh}:${mm}:${ss}`;
  }

  // Snapshots (keep last 3)
  function getSnapshots() {
    try { return JSON.parse(localStorage.getItem(STORAGE.snapshots) || '[]'); } catch { return []; }
  }
  function setSnapshots(arr) {
    localStorage.setItem(STORAGE.snapshots, JSON.stringify(arr.slice(0, 3)));
  }
  function addSnapshotFromDelta(deltaObj, title) {
    if (!deltaObj) return;
    const snapshots = getSnapshots();
    snapshots.unshift({ ts: Date.now(), title: title || 'Untitled', delta: deltaObj });
    setSnapshots(snapshots);
    refreshVersionSelect();
  }
  function refreshVersionSelect() {
    const snaps = getSnapshots();
    versionSelectEl.innerHTML = '';
    if (!snaps.length) {
      const op = document.createElement('option');
      op.textContent = '(none)';
      versionSelectEl.appendChild(op);
      return;
    }
    snaps.forEach((s, idx) => {
      const op = document.createElement('option');
      const when = new Date(s.ts).toLocaleString();
      op.value = String(idx);
      op.textContent = `${when} — ${s.title || 'Untitled'}`;
      versionSelectEl.appendChild(op);
    });
  }

  // Autosave
  let lastDeltaJson = null;
  function save(forceSnapshot = false) {
    const title = (titleEl.value || '').trim() || 'Untitled Document';
    const delta = quill.getContents();
    const deltaJson = JSON.stringify(delta);

    // Save snapshot of previous version when content changes
    if ((lastDeltaJson && lastDeltaJson !== deltaJson) || forceSnapshot) {
      try {
        const prev = JSON.parse(lastDeltaJson || 'null');
        if (prev) addSnapshotFromDelta(prev, localStorage.getItem(STORAGE.title) || title);
      } catch { /* ignore */ }
    }

    localStorage.setItem(STORAGE.title, title);
    localStorage.setItem(STORAGE.delta, deltaJson);
    localStorage.setItem(STORAGE.html, quill.root.innerHTML);
    lastDeltaJson = deltaJson;
    updateSaveIndicator();
  }

  function restoreFromStorage() {
    const savedTitle = localStorage.getItem(STORAGE.title) || '';
    const savedDelta = localStorage.getItem(STORAGE.delta);
    if (savedTitle) titleEl.value = savedTitle;
    if (savedDelta) {
      try { quill.setContents(JSON.parse(savedDelta)); } catch { /* ignore */ }
    } else {
      quill.setText('');
    }
    updateCounts();
    refreshVersionSelect();
  }

  // Utilities
  function downloadFile(filename, content, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function slugify(str) {
    return (str || 'document').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60) || 'document';
  }

  // Exporters
  function exportHTML() {
    const title = (titleEl.value || 'Document').trim() || 'Document';
    const htmlContent = quill.root.innerHTML;
    const full = `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8"/>\n<meta name="viewport" content="width=device-width, initial-scale=1"/>\n<title>${title}</title>\n<style>\n  body{font-family:Inter,system-ui,Segoe UI,Roboto,Arial,sans-serif;background:#f6f7fb;color:#0f172a;margin:0;padding:2rem;}\n  .page{max-width:816px;margin:0 auto;background:#fff;border-radius:12px;box-shadow:0 10px 30px rgba(24,39,75,.12);border:1px solid #e2e8f0;}\n  .content{padding:2rem;min-height:400px;line-height:1.65;font-size:16px;}\n  .content h1{font-size:2em} .content h2{font-size:1.6em} .content h3{font-size:1.35em}\n  .ql-size-small{font-size:.75em} .ql-size-large{font-size:1.5em} .ql-size-huge{font-size:2.5em}\n  .ql-align-center{text-align:center}.ql-align-right{text-align:right}.ql-align-justify{text-align:justify}\n  blockquote{border-left:4px solid #e5e7eb;margin:1rem 0;padding:.5rem 1rem;color:#475569}\n  pre.ql-syntax{background:#0b1320;color:#e5e7eb;border-radius:8px;padding:1rem;overflow:auto}\n  img{max-width:100%;height:auto}\n</style>\n</head>\n<body>\n<article class="page">\n  <div class="content">${htmlContent}</div>\n</article>\n</body>\n</html>`;
    downloadFile(`${slugify(title)}.html`, full, 'text/html');
  }

  function exportMarkdown() {
    const title = (titleEl.value || 'Document').trim() || 'Document';
    const td = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
    const html = quill.root.innerHTML;
    const md = td.turndown(html);
    downloadFile(`${slugify(title)}.md`, md, 'text/markdown');
  }

  function exportPDF() {
    const title = (titleEl.value || 'Document').trim() || 'Document';
    const element = document.querySelector('#page');
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `${slugify(title)}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  }

  // Importer
  function handleImportFile(file) {
    const name = (file && file.name) || '';
    const isJSON = /\.json$/i.test(name);
    const isHTML = /\.(html|htm)$/i.test(name);
    if (!isJSON && !isHTML) {
      alert('Please select an HTML or JSON file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        if (isJSON) {
          const obj = JSON.parse(reader.result);
          let delta = null;
          if (obj && obj.ops) delta = obj; // raw Quill delta
          else if (obj && obj.delta && obj.delta.ops) delta = obj.delta; // wrapped
          if (!delta) throw new Error('Invalid JSON: expected Quill Delta');
          quill.setContents(delta);
          if (obj.title) titleEl.value = obj.title;
        } else if (isHTML) {
          const html = reader.result;
          quill.clipboard.dangerouslyPasteHTML(html);
        }
        save(true);
        updateCounts();
        alert('Import complete.');
      } catch (e) {
        console.error(e);
        alert('Failed to import file. Make sure the JSON is a Quill Delta or the HTML is valid.');
      }
    };
    reader.readAsText(file);
  }

  // Actions
  function bindActions() {
    themeToggle.addEventListener('click', toggleTheme);

    btnNew.addEventListener('click', () => {
      const hasContent = (quill.getText() || '').trim().length > 0 || (titleEl.value || '').trim().length > 0;
      if (!hasContent || confirm('Start a new document? Unsaved changes will be kept in versions.')) {
        titleEl.value = '';
        quill.setText('');
        save(true);
        updateCounts();
      }
    });

    btnImport.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) handleImportFile(file);
      fileInput.value = '';
    });

    btnSaveHtml.addEventListener('click', exportHTML);
    btnExportMd.addEventListener('click', exportMarkdown);
    btnExportPdf.addEventListener('click', exportPDF);

    btnClear.addEventListener('click', () => {
      if (!confirm('Clear all local data (title, content, snapshots)? This cannot be undone.')) return;
      localStorage.removeItem(STORAGE.title);
      localStorage.removeItem(STORAGE.delta);
      localStorage.removeItem(STORAGE.html);
      localStorage.removeItem(STORAGE.snapshots);
      titleEl.value = '';
      quill.setText('');
      lastDeltaJson = null;
      refreshVersionSelect();
      updateCounts();
      updateSaveIndicator();
      alert('Local data cleared.');
    });

    btnRestore.addEventListener('click', () => {
      const idx = parseInt(versionSelectEl.value, 10);
      const snaps = getSnapshots();
      if (Number.isNaN(idx) || !snaps[idx]) { alert('No snapshot selected.'); return; }
      const snap = snaps[idx];
      quill.setContents(snap.delta);
      if (snap.title) titleEl.value = snap.title;
      save(true);
      updateCounts();
    });
  }

  // Autosave timer & lifecycle
  function bindAutosave() {
    setInterval(() => save(false), 5000);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') save(false);
    });
    window.addEventListener('beforeunload', () => save(false));
    titleEl.addEventListener('blur', () => save(false));
  }

  // Boot
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initEditor();
    bindActions();
    bindAutosave();
    restoreFromStorage();
    updateSaveIndicator();
  });
})();
