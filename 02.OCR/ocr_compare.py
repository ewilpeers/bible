"""
ocr_compare.py — Generate HTML comparisons of Fraktur OCR output.

Usage in Jupyter:
    from ocr_compare import render_comparison
    render_comparison("PA623_raw.txt", "PA623_clean.txt")

Or render all pages at once:
    render_all(["PA623", "PA624", "PA625"], input_dir=".")
"""

import html
import os
import re
from pathlib import Path

# ---------------------------------------------------------------------------
# Fraktur transliteration map (Latin → Unicode Fraktur Mathematical symbols)
# ---------------------------------------------------------------------------
_FRAKTUR_MAP = {}
for i, c in enumerate("ABCDEFGHIJKLMNOPQRSTUVWXYZ"):
    # Mathematical Fraktur Bold capitals: U+1D56C–U+1D585
    _FRAKTUR_MAP[c] = chr(0x1D56C + i)
for i, c in enumerate("abcdefghijklmnopqrstuvwxyz"):
    # Mathematical Fraktur Bold lowercase: U+1D586–U+1D59F
    _FRAKTUR_MAP[c] = chr(0x1D586 + i)
# Keep digits, punctuation, whitespace as-is


def to_fraktur_unicode(text: str) -> str:
    """Convert Latin text to Unicode Mathematical Fraktur Bold characters."""
    return "".join(_FRAKTUR_MAP.get(c, c) for c in text)


def _escape(text: str) -> str:
    """HTML-escape text, preserving newlines."""
    return html.escape(text)


# ---------------------------------------------------------------------------
# HTML generation
# ---------------------------------------------------------------------------

_CSS = """
<style>
@import url('https://fonts.googleapis.com/css2?family=UnifrakturCook:wght@700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;1,400&display=swap');

:root {
    --parchment: #f5f0e1;
    --parchment-dark: #e8dfc8;
    --ink: #2c1810;
    --ink-light: #5a3d2b;
    --red: #8b2500;
    --gold: #b8860b;
    --border: #c4b799;
    --tab-bg: #d4c9a8;
    --tab-active: #f5f0e1;
    --shadow: rgba(44, 24, 16, 0.15);
}

.ocr-comparison {
    font-family: 'EB Garamond', 'Georgia', serif;
    max-width: 1200px;
    margin: 2em auto;
    background: var(--parchment);
    border: 2px solid var(--border);
    border-radius: 4px;
    box-shadow: 0 4px 20px var(--shadow);
}

.ocr-header {
    background: var(--ink);
    color: var(--parchment);
    padding: 16px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.ocr-header h2 {
    margin: 0;
    font-family: 'UnifrakturCook', cursive;
    font-size: 1.6em;
    letter-spacing: 0.03em;
    font-weight: 700;
}

.ocr-header .page-label {
    font-size: 0.85em;
    color: var(--gold);
    letter-spacing: 0.1em;
    text-transform: uppercase;
}

.ocr-tabs {
    display: flex;
    border-bottom: 2px solid var(--border);
    background: var(--parchment-dark);
    padding: 0;
    margin: 0;
    list-style: none;
}

.ocr-tabs li {
    padding: 10px 20px;
    cursor: pointer;
    font-size: 0.95em;
    color: var(--ink-light);
    border-right: 1px solid var(--border);
    transition: background 0.2s, color 0.2s;
    user-select: none;
    font-weight: 600;
}

.ocr-tabs li:hover {
    background: var(--parchment);
}

.ocr-tabs li.active {
    background: var(--parchment);
    color: var(--ink);
    border-bottom: 2px solid var(--parchment);
    margin-bottom: -2px;
}

.ocr-panel {
    display: none;
    padding: 24px 32px;
    min-height: 300px;
    max-height: 80vh;
    overflow-y: auto;
}

.ocr-panel.active {
    display: block;
}

.ocr-panel pre {
    margin: 0;
    white-space: pre-wrap;
    word-wrap: break-word;
    line-height: 1.7;
    color: var(--ink);
}

/* Fraktur rendering with the web font */
.panel-fraktur-font pre {
    font-family: 'UnifrakturCook', cursive;
    font-size: 1.15em;
    letter-spacing: 0.02em;
}

/* Unicode Fraktur characters — use a serif fallback */
.panel-fraktur-unicode pre {
    font-family: 'EB Garamond', 'Noto Serif', serif;
    font-size: 1.2em;
}

/* Clean Latin */
.panel-clean pre {
    font-family: 'EB Garamond', 'Georgia', serif;
    font-size: 1.05em;
}

/* Raw OCR */
.panel-raw pre {
    font-family: 'EB Garamond', 'Georgia', serif;
    font-size: 1.0em;
    color: var(--ink-light);
}

/* Side-by-side diff */
.ocr-sidebyside {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0;
}

.ocr-sidebyside .side {
    padding: 24px;
    overflow-y: auto;
    max-height: 80vh;
}

.ocr-sidebyside .side:first-child {
    border-right: 2px solid var(--border);
}

.ocr-sidebyside .side-label {
    font-weight: 700;
    color: var(--red);
    margin-bottom: 12px;
    font-size: 0.9em;
    text-transform: uppercase;
    letter-spacing: 0.08em;
}

.ocr-sidebyside pre {
    margin: 0;
    white-space: pre-wrap;
    word-wrap: break-word;
    line-height: 1.7;
    color: var(--ink);
    font-family: 'EB Garamond', 'Georgia', serif;
    font-size: 1.0em;
}

/* Verse numbers highlighted */
.verse-num {
    color: var(--red);
    font-weight: 700;
}
</style>
"""


def _highlight_verses(text_html: str) -> str:
    """Wrap verse numbers like '9.' or '10.' at line starts in a span."""
    return re.sub(
        r'^(\d+\.)',
        r'<span class="verse-num">\1</span>',
        text_html,
        flags=re.MULTILINE,
    )


def _make_tabbed_html(page_name: str, raw: str, clean: str, uid: str) -> str:
    """Build a single tabbed comparison widget."""

    raw_esc = _highlight_verses(_escape(raw))
    clean_esc = _highlight_verses(_escape(clean))
    fraktur_font_esc = _highlight_verses(_escape(clean))  # same text, rendered in Fraktur font
    fraktur_unicode = _highlight_verses(_escape(to_fraktur_unicode(clean)))

    return f"""
<div class="ocr-comparison" id="comp-{uid}">
  <div class="ocr-header">
    <h2>OCR Comparison</h2>
    <span class="page-label">{_escape(page_name)}</span>
  </div>

  <ul class="ocr-tabs" id="tabs-{uid}">
    <li class="active" onclick="switchTab('{uid}', 0)">𝕱𝖗𝖆𝖐𝖙𝖚𝖗 (font)</li>
    <li onclick="switchTab('{uid}', 1)">𝕱𝖗𝖆𝖐𝖙𝖚𝖗 (unicode)</li>
    <li onclick="switchTab('{uid}', 2)">Clean (Latin)</li>
    <li onclick="switchTab('{uid}', 3)">Raw OCR</li>
    <li onclick="switchTab('{uid}', 4)">Side-by-side</li>
  </ul>

  <div class="ocr-panel panel-fraktur-font active" id="panel-{uid}-0">
    <pre>{fraktur_font_esc}</pre>
  </div>

  <div class="ocr-panel panel-fraktur-unicode" id="panel-{uid}-1">
    <pre>{fraktur_unicode}</pre>
  </div>

  <div class="ocr-panel panel-clean" id="panel-{uid}-2">
    <pre>{clean_esc}</pre>
  </div>

  <div class="ocr-panel panel-raw" id="panel-{uid}-3">
    <pre>{raw_esc}</pre>
  </div>

  <div class="ocr-panel" id="panel-{uid}-4">
    <div class="ocr-sidebyside">
      <div class="side">
        <div class="side-label">Raw (Tesseract output)</div>
        <pre>{raw_esc}</pre>
      </div>
      <div class="side">
        <div class="side-label">Clean (post-processed)</div>
        <pre>{clean_esc}</pre>
      </div>
    </div>
  </div>
</div>
"""


_JS = """
<script>
function switchTab(uid, idx) {
    // Deactivate all tabs and panels for this widget
    const tabs = document.querySelectorAll('#tabs-' + uid + ' li');
    for (let i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove('active');
        document.getElementById('panel-' + uid + '-' + i).classList.remove('active');
    }
    // Activate selected
    tabs[idx].classList.add('active');
    document.getElementById('panel-' + uid + '-' + idx).classList.add('active');
}
</script>
"""


def build_html(pages: list[dict], title: str = "Fraktur OCR Comparison") -> str:
    """
    Build a full HTML document.

    pages: list of dicts with keys 'name', 'raw', 'clean'
    """
    parts = [
        "<!DOCTYPE html>",
        f"<html><head><meta charset='utf-8'><title>{_escape(title)}</title>",
        _CSS,
        "</head><body style='background:#e0d8c4; padding:20px;'>",
    ]

    for i, page in enumerate(pages):
        uid = f"p{i}"
        parts.append(_make_tabbed_html(page["name"], page["raw"], page["clean"], uid))

    parts.append(_JS)
    parts.append("</body></html>")
    return "\n".join(parts)


# ---------------------------------------------------------------------------
# Jupyter helpers
# ---------------------------------------------------------------------------

def render_comparison(raw_path: str, clean_path: str, page_name: str = None):
    """
    Display an inline HTML comparison in Jupyter.

    Usage:
        render_comparison("PA623_raw.txt", "PA623_clean.txt")
    """
    from IPython.display import HTML, display

    raw = Path(raw_path).read_text(encoding="utf-8")
    clean = Path(clean_path).read_text(encoding="utf-8")
    if page_name is None:
        page_name = Path(raw_path).stem.replace("_raw", "")

    h = _CSS + _make_tabbed_html(page_name, raw, clean, "single") + _JS
    display(HTML(h))


def render_all(stems: list[str], input_dir: str = "."):
    """
    Render all pages in one output.

    Usage:
        render_all(["PA623", "PA624", "PA625"], input_dir="/path/to/files")
    """
    from IPython.display import HTML, display

    pages = []
    for stem in stems:
        raw_path = Path(input_dir) / f"{stem}_raw.txt"
        clean_path = Path(input_dir) / f"{stem}_clean.txt"
        if raw_path.exists() and clean_path.exists():
            pages.append({
                "name": stem,
                "raw": raw_path.read_text(encoding="utf-8"),
                "clean": clean_path.read_text(encoding="utf-8"),
            })
        else:
            print(f"WARNING: Missing files for {stem}, skipping")

    h = _CSS
    for i, page in enumerate(pages):
        h += _make_tabbed_html(page["name"], page["raw"], page["clean"], f"p{i}")
    h += _JS
    display(HTML(h))


def save_html(stems: list[str], input_dir: str = ".", output_path: str = "ocr_comparison.html"):
    """
    Save a standalone HTML file with all pages.

    Usage:
        save_html(["PA623", "PA624", "PA625"], input_dir=".", output_path="comparison.html")
    """
    pages = []
    for stem in stems:
        raw_path = Path(input_dir) / f"{stem}_raw.txt"
        clean_path = Path(input_dir) / f"{stem}_clean.txt"
        if raw_path.exists() and clean_path.exists():
            pages.append({
                "name": stem,
                "raw": raw_path.read_text(encoding="utf-8"),
                "clean": clean_path.read_text(encoding="utf-8"),
            })

    full_html = build_html(pages)
    Path(output_path).write_text(full_html, encoding="utf-8")
    print(f"Saved: {output_path} ({len(pages)} pages)")
    return output_path


if __name__ == "__main__":
    import sys
    # Quick CLI: python ocr_compare.py PA623 PA624 PA625
    stems = sys.argv[1:] if len(sys.argv) > 1 else ["PA623", "PA624", "PA625"]
    save_html(stems)
