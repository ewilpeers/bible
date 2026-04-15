#!/usr/bin/env python3
"""
compare_heb_counts.py
─────────────────────
Compare Hebrew word counts in the dataset JSONs vs CATSS .par files,
across the entire Bible or a single book.

TWO MODES:

1. Single-book (original):
   python3 compare_heb_counts.py \
       --par   10_Ruth.par \
       --json  ruth/1.json ruth/2.json ruth/3.json ruth/4.json \
       --book  ruth \
       [--out  ruth_count_diff.html]

2. Full-Bible iteration:
   python3 compare_heb_counts.py \
       --par-dir   ~/m_penn/out1 \
       --bible-dir ~/bible \
       --out-dir   ~/heb_count_reports

   Produces:
     <out-dir>/00_summary.html          -- master table, one row per book
     <out-dir>/<book>_diff.html         -- per-book detail (mismatches open,
                                           matches collapsed)

For books with two CATSS traditions (Joshua A/B, Judges A/B, Daniel OG/Th)
the script uses the *primary* stem (same preference as 51CATSS_mapf.ipynb):
  daniel  -> 46.DanielTh  (fallback 45.DanielOG)
  joshua  -> 06.JoshB     (fallback 07.JoshA)
  judges  -> 08.JudgesB   (fallback 09.JudgesA)
"""

import argparse
import json
import os
import re
import sys
from collections import defaultdict
from pathlib import Path

# ---------------------------------------------------------------------------
# CATSS <-> bible-folder mapping (from 51CATSS_mapf.ipynb)
# ---------------------------------------------------------------------------

CATSS_TO_BIBLE = {
    "01.Genesis":   "genesis",
    "02.Exodus":    "exodus",
    "03.Lev":       "leviticus",
    "04.Num":       "numbers",
    "05.Deut":      "deuteronomy",
    "06.JoshB":     "joshua",
    "07.JoshA":     "joshua",
    "08.JudgesB":   "judges",
    "09.JudgesA":   "judges",
    "10.Ruth":      "ruth",
    "11.1Sam":      "1_samuel",
    "12.2Sam":      "2_samuel",
    "13.1Kings":    "1_kings",
    "14.2Kings":    "2_kings",
    "15.1Chron":    "1_chronicles",
    "16.2Chron":    "2_chronicles",
    "17.1Esdras":   None,
    "18.Esther":    "esther",
    "18.Ezra":      "ezra",
    "19.Neh":       "nehemiah",
    "20.Psalms":    "psalms",
    "22.Ps151":     None,
    "23.Prov":      "proverbs",
    "24.Qoh":       "ecclesiastes",
    "25.Cant":      "songs",
    "26.Job":       "job",
    "27.Sirach":    None,
    "28.Hosea":     "hosea",
    "29.Micah":     "micah",
    "30.Amos":      "amos",
    "31.Joel":      "joel",
    "32.Jonah":     "jonah",
    "33.Obadiah":   "obadiah",
    "34.Nahum":     "nahum",
    "35.Hab":       "habakkuk",
    "36.Zeph":      "zephaniah",
    "37.Haggai":    "haggai",
    "38.Zech":      "zechariah",
    "39.Malachi":   "malachi",
    "40.Isaiah":    "isaiah",
    "41.Jer":       "jeremiah",
    "42.Baruch":    None,
    "43.Lam":       "lamentations",
    "44.Ezekiel":   "ezekiel",
    "45.DanielOG":  "daniel",
    "46.DanielTh":  "daniel",
}

_ORDER_HINT = {
    "joshua": ["06.JoshB", "07.JoshA"],
    "judges": ["08.JudgesB", "09.JudgesA"],
    "daniel": ["46.DanielTh", "45.DanielOG"],
}


def _build_bible_to_catss():
    btc = defaultdict(list)
    for stem, bible in CATSS_TO_BIBLE.items():
        if bible is None:
            continue
        btc[bible].append(stem)
    for bible, ordered in _ORDER_HINT.items():
        if bible in btc:
            btc[bible] = ordered
    return dict(btc)


BIBLE_TO_CATSS = _build_bible_to_catss()

# ---------------------------------------------------------------------------
# Tokenization
# ---------------------------------------------------------------------------

_STRIP_TOKENS = {
    '^', '^^^',
    '---',          # row kept (Hebrew IS in MT), but token itself not added
    '--+',          # whole row is LXX-only; handled via _is_plus_row()
    '?', '??',
    "''", "'",
    '~~~', '~',
}

_LONE_FINAL_LETTERS = {'K', 'M', 'N', 'P', 'C', 'S'}


def _is_marker_token(t):
    if t in _STRIP_TOKENS:
        return True
    if t.startswith('{'):
        return True   # {..p}, {...}, {d}, {!} ...
    if t.startswith('='):
        return True   # =:WORD  =v  col-b retroversions
    if t.startswith('<'):
        return True   # <la1.4> cross-references
    if t.startswith('.'):
        return True   # .lb  .wy  .m  col-b annotation suffixes
    if t.lstrip('*') == '':
        return True   # bare * or **
    return False


def _is_plus_row(heb_col):
    s = heb_col.strip()
    return s == '--+' or s.startswith("''")


def _tokenize_par_heb(heb_col):
    """Return list of real col-a MT Hebrew token strings for one .par line."""
    if _is_plus_row(heb_col):
        return []

    real = []
    seen_bare = set()

    for t in heb_col.split():
        if _is_marker_token(t):
            continue
        bare = t.lstrip('*')
        if not bare:
            continue
        if bare == 'z':          # *z / **z  qere-wela-ketib placeholder
            continue
        if bare in seen_bare:    # deduplicate ketiv/qere pairs (*WORD / **WORD)
            continue
        seen_bare.add(bare)
        if bare in _LONE_FINAL_LETTERS and real:
            real[-1] = real[-1] + bare   # attach detached sofit to previous
            continue
        real.append(t)

    return real


# ---------------------------------------------------------------------------
# PAR parser
# ---------------------------------------------------------------------------

_VERSE_RE = re.compile(r'^.+?\s+(\d+):(\d+)\s*$')


def parse_par(par_path):
    """
    Returns {(chapter, verse): [col_a_heb_token, ...]}
    """
    verses = {}
    current_key = None

    with open(par_path, encoding='utf-8') as fh:
        for raw_line in fh:
            line = raw_line.rstrip('\n').rstrip('\r')
            if not line.strip():
                continue

            if '\t' not in line:
                m = _VERSE_RE.match(line)
                if m:
                    current_key = (int(m.group(1)), int(m.group(2)))
                    if current_key not in verses:
                        verses[current_key] = []
                continue

            if current_key is None:
                continue

            heb_col = line.split('\t')[0]

            # Transposition target rows ("^ ^^^ =REALWORD"): already counted
            # on the source row, skip entirely.
            s = heb_col.strip()
            if s.startswith('^ ^^^') or s == '^':
                continue

            tokens = _tokenize_par_heb(heb_col)
            verses[current_key].extend(tokens)

    return verses


# ---------------------------------------------------------------------------
# JSON loader
# ---------------------------------------------------------------------------

def load_json_book(book_path):
    """
    Returns {(chapter, verse_1based): [hebrew_word_str, ...]}
    """
    result = {}
    for jp in sorted(book_path.glob('*.json'),
                     key=lambda p: int(p.stem) if p.stem.isdigit() else 9999):
        if not jp.stem.isdigit():
            continue
        chapter = int(jp.stem)
        with open(jp, encoding='utf-8') as fh:
            verses = json.load(fh)
        for v_idx, verse in enumerate(verses, start=1):
            result[(chapter, v_idx)] = [
                w['hebrew'] for w in verse.get('hebrew_words', [])
            ]
    return result


# ---------------------------------------------------------------------------
# Comparison
# ---------------------------------------------------------------------------

def compare(par_verses, json_verses):
    rows = []
    for key in sorted(set(par_verses) | set(json_verses)):
        ch, vs = key
        catss_tokens = par_verses.get(key, [])
        json_hebrew  = json_verses.get(key, [])
        jc, cc = len(json_hebrew), len(catss_tokens)
        rows.append({
            'ref':          f'{ch}:{vs}',
            'ch': ch, 'vs': vs,
            'json_count':   jc,
            'catss_count':  cc,
            'delta':        jc - cc,
            'catss_tokens': catss_tokens,
            'json_hebrew':  json_hebrew,
            'match':        jc == cc,
        })
    return rows


# ---------------------------------------------------------------------------
# HTML helpers
# ---------------------------------------------------------------------------

_CSS = """
body{font-family:system-ui,sans-serif;font-size:14px;margin:2em;background:#fafafa}
h1{font-size:1.4em;margin-bottom:.3em}
h2{margin-top:1.5em;border-bottom:2px solid #ccc;padding-bottom:.2em}
.ch-summary{font-size:.9em;color:#555;margin-left:1em;font-weight:normal}
.summary{background:#fff;border:1px solid #ddd;border-radius:6px;
         padding:1em 1.5em;display:inline-block;margin-bottom:1.5em}
.stat{display:inline-block;margin-right:2em}
.stat span{font-size:1.6em;font-weight:bold}
details{margin-bottom:.3em}
summary{cursor:pointer;padding:.25em .4em;border-radius:4px;
        list-style:none;display:flex;gap:1em;align-items:baseline}
summary::-webkit-details-marker{display:none}
summary .ref{font-weight:bold;width:5em;flex-shrink:0}
summary .badge{font-size:.75em;padding:1px 6px;border-radius:10px;font-weight:bold}
.ok>summary{background:#f0faf0}.ok .badge{background:#c8efc8;color:#1a6b1a}
.bad>summary{background:#fff3f0}.bad .badge{background:#ffdad4;color:#8b1a00}
.detail-grid{display:grid;grid-template-columns:5em 1fr;gap:.3em .8em;
             padding:.6em 1em .6em 2em;background:#fff;
             border:1px solid #e0e0e0;border-top:none;border-radius:0 0 4px 4px}
.detail-grid .label{color:#666;font-size:.85em}
.heb{direction:rtl;font-size:1.1em;letter-spacing:.05em}
.catss{font-family:monospace;font-size:.9em;color:#333}
table.sum{border-collapse:collapse;width:100%;max-width:960px}
table.sum th,table.sum td{border:1px solid #ddd;padding:.4em .7em;text-align:left}
table.sum th{background:#f0f0f0}
table.sum tr.all-ok{background:#f6fff6}
table.sum tr.has-bad{background:#fff8f6}
td.num{text-align:right}
td.pct{text-align:right;white-space:nowrap}
.bar-wrap{display:inline-block;width:100px;height:9px;background:#ddd;
          border-radius:3px;vertical-align:middle;margin-left:5px}
.bar-fill{height:9px;border-radius:3px;background:#1a6b1a;display:block}
a{color:#1a4b8a}
"""


def _book_html(book, rows, par_stem):
    mismatches = [r for r in rows if not r['match']]
    total    = len(rows)
    match_ct = total - len(mismatches)

    by_ch = defaultdict(list)
    for r in rows:
        by_ch[r['ch']].append(r)

    parts = [f"""<!DOCTYPE html><html lang="en"><head>
<meta charset="utf-8">
<title>{book} - Hebrew count diff</title>
<style>{_CSS}</style></head><body>
<p><a href="00_summary.html">&#8592; All books</a></p>
<h1>Hebrew word count diff &mdash; <em>{book}</em>
<span style="font-size:.7em;color:#888">({par_stem}.par)</span></h1>
<div class="summary">
  <div class="stat">Total verses <span>{total}</span></div>
  <div class="stat">Match <span style="color:#1a6b1a">{match_ct}</span></div>
  <div class="stat">Mismatch <span style="color:#c00">{len(mismatches)}</span></div>
</div>
"""]

    for ch in sorted(by_ch):
        ch_rows = by_ch[ch]
        ch_bad  = sum(1 for r in ch_rows if not r['match'])
        parts.append(
            f'<h2>Chapter {ch}'
            f'<span class="ch-summary">{ch_bad} mismatch / {len(ch_rows)} verses</span></h2>\n'
        )
        for r in ch_rows:
            cls   = 'ok' if r['match'] else 'bad'
            delta = r['delta']
            dsign = f"+{delta}" if delta > 0 else str(delta)
            badge = "match" if r['match'] else f"delta {dsign}"
            open_attr = ' open' if not r['match'] else ''

            j_heb  = '&emsp;'.join(r['json_hebrew'])
            c_toks = '&nbsp;'.join(
                f'<span class="catss">{t}</span>' for t in r['catss_tokens']
            )
            parts.append(
                f'<details class="{cls}"{open_attr}>\n'
                f'  <summary>'
                f'<span class="ref">{r["ref"]}</span>'
                f'<span class="badge">{badge}</span>'
                f'<span style="color:#888;font-size:.85em">'
                f'json {r["json_count"]} | catss {r["catss_count"]}'
                f'</span></summary>\n'
                f'  <div class="detail-grid">'
                f'<span class="label">JSON Hebrew</span>'
                f'<span class="heb">{j_heb or "<em>empty</em>"}</span>'
                f'<span class="label">CATSS tokens</span>'
                f'<span>{c_toks or "<em>empty</em>"}</span>'
                f'</div>\n</details>\n'
            )

    parts.append("</body></html>\n")
    return ''.join(parts)


def _summary_html(book_stats):
    covered     = [b for b in book_stats if not b.get('skipped_reason')]
    total_v     = sum(b['total']    for b in covered)
    total_match = sum(b['match']    for b in covered)
    total_bad   = sum(b['mismatch'] for b in covered)
    pct_all     = round(100 * total_match / total_v, 1) if total_v else 0

    rows_html = []
    for b in book_stats:
        if b.get('skipped_reason'):
            rows_html.append(
                f'<tr><td>{b["book"]}</td>'
                f'<td colspan="5" style="color:#aaa;font-style:italic">'
                f'{b["skipped_reason"]}</td></tr>\n'
            )
            continue
        pct = round(100 * b['match'] / b['total'], 1) if b['total'] else 0
        bar = (f'<span class="bar-wrap">'
               f'<span class="bar-fill" style="width:{pct}%"></span></span>')
        cls  = 'all-ok' if b['mismatch'] == 0 else 'has-bad'
        link = f'<a href="{b["book"]}_diff.html">{b["book"]}</a>'
        bad_col = (f'<span style="color:#c00;font-weight:bold">{b["mismatch"]}</span>'
                   if b['mismatch'] else '0')
        rows_html.append(
            f'<tr class="{cls}">'
            f'<td>{link}</td>'
            f'<td style="font-family:monospace;font-size:.9em">{b["par_stem"]}</td>'
            f'<td class="num">{b["total"]}</td>'
            f'<td class="num" style="color:#1a6b1a">{b["match"]}</td>'
            f'<td class="num">{bad_col}</td>'
            f'<td class="pct">{pct}%{bar}</td>'
            f'</tr>\n'
        )

    return f"""<!DOCTYPE html><html lang="en"><head>
<meta charset="utf-8">
<title>Hebrew count diff - All books</title>
<style>{_CSS}</style></head><body>
<h1>Hebrew word count diff &mdash; All books</h1>
<div class="summary">
  <div class="stat">Books covered <span>{len(covered)}</span></div>
  <div class="stat">Total verses <span>{total_v:,}</span></div>
  <div class="stat">Match <span style="color:#1a6b1a">{total_match:,}</span></div>
  <div class="stat">Mismatch <span style="color:#c00">{total_bad:,}</span></div>
  <div class="stat">Match rate <span style="color:#1a6b1a">{pct_all}%</span></div>
</div>
<table class="sum">
<tr><th>Book</th><th>PAR stem</th>
    <th class="num">Verses</th><th class="num">Match</th>
    <th class="num">Mismatch</th><th>Match %</th></tr>
{''.join(rows_html)}
</table>
</body></html>
"""


# ---------------------------------------------------------------------------
# Text console report
# ---------------------------------------------------------------------------

def print_text_report(book, rows):
    mismatches = [r for r in rows if not r['match']]
    total = len(rows)
    pct   = round(100 * (total - len(mismatches)) / total, 1) if total else 0
    print(f"  {book:22s}  {total:5d} verses  {pct:5.1f}% match"
          f"  {len(mismatches)} mismatch")
    for r in mismatches:
        dsign = f"+{r['delta']}" if r['delta'] > 0 else str(r['delta'])
        j_p = '  '.join(r['json_hebrew'][:6]) + ('  ...' if len(r['json_hebrew']) > 6 else '')
        c_p = '  '.join(r['catss_tokens'][:6]) + ('  ...' if len(r['catss_tokens']) > 6 else '')
        print(f"    {r['ref']:8s} json={r['json_count']:3d} catss={r['catss_count']:3d} d={dsign:>3s}")
        print(f"              json : {j_p}")
        print(f"              catss: {c_p}")


# ---------------------------------------------------------------------------
# Single-book mode
# ---------------------------------------------------------------------------

def run_single(args):
    par_path   = Path(args.par)
    json_paths = [Path(p) for p in args.json]
    out_path   = Path(args.out) if args.out else None

    print(f"Parsing PAR: {par_path}")
    par_verses = parse_par(par_path)
    print(f"  -> {len(par_verses)} verses")

    json_verses = {}
    for jp in sorted(json_paths,
                     key=lambda p: int(p.stem) if p.stem.isdigit() else 9999):
        if not jp.stem.isdigit():
            continue
        chapter = int(jp.stem)
        with open(jp, encoding='utf-8') as fh:
            verses = json.load(fh)
        for v_idx, verse in enumerate(verses, start=1):
            json_verses[(chapter, v_idx)] = [
                w['hebrew'] for w in verse.get('hebrew_words', [])
            ]
    print(f"  -> {len(json_verses)} JSON verses")

    rows = compare(par_verses, json_verses)
    print_text_report(args.book, rows)

    if out_path:
        out_path.write_text(
            _book_html(args.book, rows, par_path.stem), encoding='utf-8'
        )
        print(f"\nHTML report -> {out_path}")


# ---------------------------------------------------------------------------
# Full-bible mode
# ---------------------------------------------------------------------------

def run_full(args):
    par_dir   = Path(os.path.expanduser(args.par_dir))
    bible_dir = Path(os.path.expanduser(args.bible_dir))
    out_dir   = Path(os.path.expanduser(args.out_dir))
    out_dir.mkdir(parents=True, exist_ok=True)

    books = sorted(
        d.name for d in bible_dir.iterdir()
        if d.is_dir() and d.name != 'excel'
    )
    print(f"Found {len(books)} book folders in {bible_dir}")
    print(f"PAR dir : {par_dir}")
    print(f"Out dir : {out_dir}\n")

    book_stats = []

    for book in books:
        if book not in BIBLE_TO_CATSS:
            print(f"skip  {book}: no CATSS mapping")
            book_stats.append({'book': book, 'par_stem': '-',
                                'total': 0, 'match': 0, 'mismatch': 0,
                                'skipped_reason': 'no CATSS mapping'})
            continue

        # Find first available .par for this book
        par_path = par_stem = None
        for stem in BIBLE_TO_CATSS[book]:
            c = par_dir / f"{stem}.par"
            if c.exists():
                par_path, par_stem = c, stem
                break

        if par_path is None:
            tried = ', '.join(BIBLE_TO_CATSS[book])
            print(f"miss  {book}: no .par file (tried {tried})")
            book_stats.append({'book': book, 'par_stem': '-',
                                'total': 0, 'match': 0, 'mismatch': 0,
                                'skipped_reason': 'no .par file'})
            continue

        json_verses = load_json_book(bible_dir / book)
        if not json_verses:
            print(f"miss  {book}: no chapter JSON files")
            book_stats.append({'book': book, 'par_stem': par_stem,
                                'total': 0, 'match': 0, 'mismatch': 0,
                                'skipped_reason': 'no JSON files'})
            continue

        par_verses = parse_par(par_path)
        rows       = compare(par_verses, json_verses)

        total    = len(rows)
        match_ct = sum(1 for r in rows if r['match'])
        bad_ct   = total - match_ct

        print_text_report(book, rows)

        (out_dir / f"{book}_diff.html").write_text(
            _book_html(book, rows, par_stem), encoding='utf-8'
        )

        book_stats.append({
            'book': book, 'par_stem': par_stem,
            'total': total, 'match': match_ct, 'mismatch': bad_ct,
            'skipped_reason': None,
        })

    # Summary HTML
    summary_path = out_dir / "00_summary.html"
    summary_path.write_text(_summary_html(book_stats), encoding='utf-8')

    covered     = [b for b in book_stats if not b.get('skipped_reason')]
    total_v     = sum(b['total']    for b in covered)
    total_match = sum(b['match']    for b in covered)
    total_bad   = sum(b['mismatch'] for b in covered)
    pct_all     = round(100 * total_match / total_v, 1) if total_v else 0

    print(f"\n{'='*60}")
    print(f"  Books: {len(covered)}  |  Verses: {total_v:,}  |  "
          f"Match: {total_match:,}  |  Mismatch: {total_bad:,}  ({pct_all}%)")
    print(f"  Summary  -> {summary_path}")
    print(f"  Per-book -> {out_dir}/<book>_diff.html")
    print(f"{'='*60}")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    ap = argparse.ArgumentParser(
        description="Compare Hebrew word counts: JSON dataset vs CATSS .par"
    )
    # Single-book flags
    ap.add_argument('--par',  help="[single] Path to .par file")
    ap.add_argument('--json', nargs='+', help="[single] Chapter JSON files")
    ap.add_argument('--book', help="[single] Book name for report title")
    ap.add_argument('--out',  help="[single] Output HTML path")
    # Full-bible flags
    ap.add_argument('--par-dir',   help="[full] Directory with *.par files")
    ap.add_argument('--bible-dir', help="[full] Directory with book sub-folders")
    ap.add_argument('--out-dir',   help="[full] Output directory for HTML reports")

    args = ap.parse_args()

    if args.par_dir and args.bible_dir and args.out_dir:
        run_full(args)
    elif args.par and args.json and args.book:
        run_single(args)
    else:
        ap.print_help()
        sys.exit(1)


if __name__ == '__main__':
    main()
