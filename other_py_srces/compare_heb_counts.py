#!/usr/bin/env python3
"""
compare_heb_counts.py
─────────────────────
Compare Hebrew word counts in dataset JSONs vs CATSS .par files.

TWO MODES:

1. Single-book:
   python3 compare_heb_counts.py \
       --par   10_Ruth.par \
       --json  1.json 2.json 3.json 4.json \
       --book  ruth \
       [--out  ruth_diff.html]

2. Full-Bible:
   python3 compare_heb_counts.py \
       --par-dir   ~/m_penn/out1 \
       --bible-dir ~/bible \
       --out-dir   ~/heb_count_reports

MATCH CATEGORIES (also shown in HTML with colour):
  ✓ green  : json count == catss count, all words match
  ~ orange : counts differ by exactly 1 AND the discrepancy is a lone sofit
             letter (ך ם ן ף ץ) that CATSS merged with its preceding word
  ✗ red    : other mismatch
"""

import argparse
import json
import os
import re
import sys
import unicodedata
from collections import defaultdict
from pathlib import Path
hb_to_l65_splittable ={}
l65_to_hb={}
l65_to_hb_merge={}
# mergverses is ho many first verser to merge, 
# 1+2   -> 2 verses
# 1,2,3 -> 3 verses
def add_psalms_merging_verse_n_in_1965(chap, maxverse, mergverses=2):
    mergekey = []
    for i in range (1, mergverses+1):
        mergekey.append(('psalms', chap, i))
    l65_to_hb_merge[tuple(mergekey)] = ('psalms', chap, 1)
    for i in range(mergverses+1, maxverse+1):
        l65_to_hb[('psalms', chap, i)]=('psalms', chap, i-(mergverses-2)-1)
    #now remove the extra pointers::
    for i in range (mergverses-1):
        #fake verse so that key is not overwritten...
        l65_to_hb[('xpsalms', chap, maxverse+1+i)]=('psalms', chap, maxverse-i)

        
add_psalms_merging_verse_n_in_1965(3, 9)
add_psalms_merging_verse_n_in_1965(4, 9)
add_psalms_merging_verse_n_in_1965(5, 13)
add_psalms_merging_verse_n_in_1965(6, 11)
add_psalms_merging_verse_n_in_1965(7, 18)
add_psalms_merging_verse_n_in_1965(8, 10)
add_psalms_merging_verse_n_in_1965(9, 21)
#how come, but this is not like in Latvian65 exception of rule...
#add_psalms_merging_verse_1_in_1965(11, 8)
add_psalms_merging_verse_n_in_1965(12, 9)

add_psalms_merging_verse_n_in_1965(13, 5)
# verse 5 is 5 and 6 split on B/Y$W(T/K
#l65_to_hb_split = {('psalms', 13, 5): ['B/Y$W(T/K', ('psalms', 13, 5), ('psalms', 13, 6)]}
#now fix the added overwrite....
del l65_to_hb[('xpsalms', 13, 6)]
hb_to_l65_splittable [('psalms', 13, 5)] = (('psalms', 13, 6), 'B/Y$W(T/K', 0)
hb_to_l65_splittable [('psalms', 13, 6)] = (('psalms', 13, 6), 'B/Y$W(T/K', 1)
add_psalms_merging_verse_n_in_1965(18, 51)
add_psalms_merging_verse_n_in_1965(19, 15)
add_psalms_merging_verse_n_in_1965(20, 10)
add_psalms_merging_verse_n_in_1965(21, 14)
add_psalms_merging_verse_n_in_1965(22, 32)
add_psalms_merging_verse_n_in_1965(30, 13)
#so far ok, therefore will leave the rest of psalms as is no check
add_psalms_merging_verse_n_in_1965(31, 25)
add_psalms_merging_verse_n_in_1965(34, 23)
add_psalms_merging_verse_n_in_1965(36, 13)
add_psalms_merging_verse_n_in_1965(38, 23)
add_psalms_merging_verse_n_in_1965(39, 14)
add_psalms_merging_verse_n_in_1965(40, 18)
add_psalms_merging_verse_n_in_1965(41, 14)
add_psalms_merging_verse_n_in_1965(42, 12)
add_psalms_merging_verse_n_in_1965(44, 27)
add_psalms_merging_verse_n_in_1965(45, 18)
add_psalms_merging_verse_n_in_1965(46, 12)
add_psalms_merging_verse_n_in_1965(47, 10)
add_psalms_merging_verse_n_in_1965(48, 15)
add_psalms_merging_verse_n_in_1965(49, 21)

#also exception, 3 verses not 2 in catss
add_psalms_merging_verse_n_in_1965(51, 21, 3)
#also exception, 3 verses not 2 in catss
add_psalms_merging_verse_n_in_1965(52, 11, 3)

add_psalms_merging_verse_n_in_1965(53, 7)

#also exception, 3 verses not 2 in catss
#!!!!! was 8 wrong!!! take looka @mappings ALL
add_psalms_merging_verse_n_in_1965(54, 9, 3)

add_psalms_merging_verse_n_in_1965(55, 24)
add_psalms_merging_verse_n_in_1965(56, 14)
add_psalms_merging_verse_n_in_1965(57, 12)
add_psalms_merging_verse_n_in_1965(58, 12)
add_psalms_merging_verse_n_in_1965(59, 18)
#also exception, 3 verses not 2 in catss
add_psalms_merging_verse_n_in_1965(60, 14, 3)
add_psalms_merging_verse_n_in_1965(61, 9)
add_psalms_merging_verse_n_in_1965(62, 13)
add_psalms_merging_verse_n_in_1965(63, 12)
add_psalms_merging_verse_n_in_1965(64, 11)
add_psalms_merging_verse_n_in_1965(65, 14)
add_psalms_merging_verse_n_in_1965(67, 8)
add_psalms_merging_verse_n_in_1965(68, 36)
add_psalms_merging_verse_n_in_1965(69, 37)
add_psalms_merging_verse_n_in_1965(70, 6)
add_psalms_merging_verse_n_in_1965(75, 11)
add_psalms_merging_verse_n_in_1965(76, 13)
add_psalms_merging_verse_n_in_1965(77, 21)
add_psalms_merging_verse_n_in_1965(80, 20)
add_psalms_merging_verse_n_in_1965(81, 17)
add_psalms_merging_verse_n_in_1965(83, 19)
add_psalms_merging_verse_n_in_1965(84, 13)
add_psalms_merging_verse_n_in_1965(85, 14)
add_psalms_merging_verse_n_in_1965(88, 19)
add_psalms_merging_verse_n_in_1965(89, 53)
add_psalms_merging_verse_n_in_1965(92, 16)
add_psalms_merging_verse_n_in_1965(102, 29)
add_psalms_merging_verse_n_in_1965(108, 14)
add_psalms_merging_verse_n_in_1965(140, 14)
add_psalms_merging_verse_n_in_1965(142, 8)

# ebreju vietturis : lv vietturis
hb_to_l65 = {v: k for k, v in l65_to_hb.items() if v[0]!= '!'}
hb_to_l65_merge = {v: k for k, v in l65_to_hb_merge.items()}
# for k, v in l65_to_hb_merge.items():
#     #multiple hebrews to single latvian
#     if isinstance(v[1], tuple):
#         for resolvedVerse in v:
#             #this is case where split string is specified for single latvian verse
#             if(isinstance(k[0], tuple) and isinstance(k[1], str)):
#                 hb_to_l65[resolvedVerse] = ("!"+k[0][0], k[0][1], k[0][2])
#                 l65_to_hb[k[0]] = ("!", -1, -1)
#             #also never happens in current list, what was the reasoning putting else here, "just so that it is"?
#             else:
#                 hb_to_l65[resolvedVerse] = ("!"+k[0], k[1], k[2])
#                 l65_to_hb[k[0]] = ("!", -1, -1)
# #value is single hebrew verse. so if key 2nd is tuple not string then
#     elif isinstance(k[1], tuple):
#         #where to split the hebrew verse (no case actually in current list!
#         if(isinstance(v[0], tuple) and isinstance(v[1], str)):
#             for resolvedVerse in k:
#                 hb_to_l65[resolvedVerse] = ("!"+v[0][0], v[0][1], v[0][2])
#                 hb_to_l65[v[0]] = ("!", -2, -2)
#         #single heb verse maps to multiple lvs, so put pointer mark ! (watch merges instead of direct)
#         #and the rest two just placeholders so that they are not misused anywhere as misguiding references
#         else:
#             for resolvedVerse in k:
#                 l65_to_hb[resolvedVerse] = ("!"+v[0], v[1], v[2])
#             #print(v[0])
#             hb_to_l65[v] = ("!", -2, -2)

def remapp(par_verses, book):
    if not book:
        return par_verses
    result ={}
    maxchap = max(ch for (ch, vs) in par_verses)
    for ch in range(1, maxchap+1):
        maxvs = max(vs for (c, vs) in par_verses if c == ch)
        for vs in range (1, maxvs+1):
            if((book, ch, vs) in hb_to_l65):
                pointer = hb_to_l65[(book, ch, vs)]
                if pointer[0].startswith("x"):
                    continue
                result[(ch, vs)] = par_verses[pointer[1], pointer[2]]
            elif(book, ch, vs) in hb_to_l65_merge:
                pointer = hb_to_l65_merge[(book, ch, vs)]
                aggregated_tokens = []
                for i in range(0, len(pointer)):
                    aggregated_tokens.extend(par_verses[pointer[i][1], pointer[i][2]])
                result[(ch, vs)] = aggregated_tokens
            elif (book, ch, vs) in hb_to_l65_splittable:
                pointer = hb_to_l65_splittable[(book, ch, vs)]
                original_tokens = par_verses[pointer[0][1], pointer[0][2]]
                appendDoesNotReturn = " ".join(original_tokens).split(pointer[1])[pointer[2]].split()
                if pointer[2] == 0:
                    appendDoesNotReturn.append(pointer[1])
                result[(ch, vs)] = appendDoesNotReturn
            else:
                if (ch, vs) in par_verses:
                    result[(ch, vs)] = par_verses[ch, vs]
    return result
# ─────────────────────────────────────────────────────────────────────────────
# CATSS ↔ bible-folder mapping
# ─────────────────────────────────────────────────────────────────────────────

CATSS_TO_BIBLE = {
    "01.Genesis":   "genesis",       "02.Exodus":    "exodus",
    "03.Lev":       "leviticus",     "04.Num":       "numbers",
    "05.Deut":      "deuteronomy",   "06.JoshB":     "joshua",
    "07.JoshA":     "joshua",        "08.JudgesB":   "judges",
    "09.JudgesA":   "judges",        "10.Ruth":      "ruth",
    "11.1Sam":      "1_samuel",      "12.2Sam":      "2_samuel",
    "13.1Kings":    "1_kings",       "14.2Kings":    "2_kings",
    "15.1Chron":    "1_chronicles",  "16.2Chron":    "2_chronicles",
    "17.1Esdras":   None,            "18.Esther":    "esther",
    "18.Ezra":      "ezra",          "19.Neh":       "nehemiah",
    "20.Psalms":    "psalms",        "22.Ps151":     None,
    "23.Prov":      "proverbs",      "24.Qoh":       "ecclesiastes",
    "25.Cant":      "songs",         "26.Job":       "job",
    "27.Sirach":    None,            "28.Hosea":     "hosea",
    "29.Micah":     "micah",         "30.Amos":      "amos",
    "31.Joel":      "joel",          "32.Jonah":     "jonah",
    "33.Obadiah":   "obadiah",       "34.Nahum":     "nahum",
    "35.Hab":       "habakkuk",      "36.Zeph":      "zephaniah",
    "37.Haggai":    "haggai",        "38.Zech":      "zechariah",
    "39.Malachi":   "malachi",       "40.Isaiah":    "isaiah",
    "41.Jer":       "jeremiah",      "42.Baruch":    None,
    "43.Lam":       "lamentations",  "44.Ezekiel":   "ezekiel",
    "45.DanielOG":  "daniel",        "46.DanielTh":  "daniel",
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


# ─────────────────────────────────────────────────────────────────────────────
# CATSS transliteration → Unicode Hebrew
# (tables from ccat_render.ipynb)
# ─────────────────────────────────────────────────────────────────────────────

HEBREW_CONSONANTS = {
    ')': '\u05d0', 'B': '\u05d1', 'G': '\u05d2', 'D': '\u05d3',
    'H': '\u05d4', 'W': '\u05d5', 'Z': '\u05d6', 'X': '\u05d7',
    '+': '\u05d8', 'Y': '\u05d9', 'K': '\u05db', 'L': '\u05dc',
    'M': '\u05de', 'N': '\u05e0', 'S': '\u05e1', '(': '\u05e2',
    'P': '\u05e4', 'C': '\u05e6', 'Q': '\u05e7', 'R': '\u05e8',
    '#': '\u05e9', '&': '\u05e9\u05c2', '$': '\u05e9\u05c1',
    'T': '\u05ea',
}

HEBREW_FINALS = {
    '\u05db': '\u05da',  # kaf -> kaf sofit
    '\u05de': '\u05dd',  # mem -> mem sofit
    '\u05e0': '\u05df',  # nun -> nun sofit
    '\u05e4': '\u05e3',  # pe  -> pe  sofit
    '\u05e6': '\u05e5',  # tsade -> tsade sofit
}

HEBREW_VOWELS = {
    'A': '\u05b7', 'F': '\u05b8', 'I': '\u05b4', 'E': '\u05b6',
    '"': '\u05b5', 'O': '\u05b9', 'U': '\u05bb', ':': '\u05b0',
}

HEBREW_PUNCT = {
    '-': '\u05be',   # maqef
    '.': '\u05bc',   # dagesh
    ',': '\u05bf',   # rafe
}


def transliterate_catss_hebrew(s):
    """Convert one CATSS Michigan-Claremont token to Unicode Hebrew string."""
    if not s or s.strip() in ('---', '--+', '^', '~', '^^^', '~~~', '^?'):
        return s or ''
    # strip leading * (ketiv/qere marker) and morpheme separator /
    word = s.lstrip('*')
    w_out = []
    j = 0
    while j < len(word):
        ch = word[j]
        two = word[j:j+2]
        if two == 'W.':                       # shureq
            w_out.append('\u05d5\u05bc')
            j += 2; continue
        if two == 'OW':                       # holem waw
            w_out.append('\u05d5\u05b9')
            j += 2; continue
        if ch in HEBREW_CONSONANTS:
            w_out.append(HEBREW_CONSONANTS[ch])
        elif ch in HEBREW_VOWELS:
            w_out.append(HEBREW_VOWELS[ch])
        elif ch in HEBREW_PUNCT:
            w_out.append(HEBREW_PUNCT[ch])
        elif ch == '/':
            w_out.append('\u200d')            # morpheme boundary (ZWJ)
        elif ch == '*':
            pass                              # skip extra * inside word
        # digits, cantillation codes, etc. — silently drop
        j += 1

    # Apply final forms to last consonant
    chars = list(''.join(w_out))
    for k in range(len(chars) - 1, -1, -1):
        if chars[k] in HEBREW_FINALS:
            tail = chars[k+1:]
            if all(0x0591 <= ord(c) <= 0x05c7 or c == '\u200d' for c in tail):
                chars[k] = HEBREW_FINALS[chars[k]]
            break
        if 0x05d0 <= ord(chars[k]) <= 0x05ea:
            break

    return unicodedata.normalize('NFC', ''.join(chars))


def catss_token_to_heb(token):
    """
    Render a raw PAR Hebrew column token to Unicode Hebrew.
    Multi-word tokens (space-separated) produce space-joined Hebrew.
    """
    parts = [transliterate_catss_hebrew(t) for t in token.split(' ') if t]
    return ' '.join(p for p in parts if p)


# ─────────────────────────────────────────────────────────────────────────────
# Tokenization
# ─────────────────────────────────────────────────────────────────────────────

_STRIP_TOKENS = {
    '^', '^^^', '---', '--+', '?', '??', "''", "'", '~~~', '~', '^?'
}

_LONE_FINAL_LETTERS = {'K', 'M', 'N', 'P', 'C', 'S'}

# Unicode sofit characters (for detecting lone final letters in JSON Hebrew)
_HEB_SOFIT_CHARS = set('ךםןףץ')
_HEB_NIKUD_RANGE = (0x0591, 0x05C7)


def _is_marker_token(t):
    if t in _STRIP_TOKENS:                 return True
    if t.startswith('{'):                  return True
    if t.startswith('='):                  return True
    if t.startswith('<'):                  return True
    if t.startswith('.'):                  return True
    if t.lstrip('*') == '':               return True
    return False


def _is_plus_row(heb_col):
    s = heb_col.strip()
    return s == '--+' or s.startswith("''")


def _tokenize_par_heb(heb_col):
    """Return list of real col-a MT Hebrew token strings."""
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
        if bare == 'z':               # *z / **z qere-wela-ketib placeholder
            continue
        if bare in seen_bare:         # deduplicate ketiv/qere
            continue
        seen_bare.add(bare)
        if bare in _LONE_FINAL_LETTERS and real:
            real[-1] = real[-1] + ' ' + t   # keep as separate for display but note
            continue
        real.append(t)
    return real


def _strip_nikud(s):
    return ''.join(c for c in s if not (_HEB_NIKUD_RANGE[0] <= ord(c) <= _HEB_NIKUD_RANGE[1]))


def _is_lone_sofit_heb(word):
    """True if the Hebrew Unicode word is a single sofit letter (with possible nikud)."""
    bare = _strip_nikud(word)
    return len(bare) == 1 and bare in _HEB_SOFIT_CHARS


def _classify_mismatch(json_hebrew, catss_tokens, delta):
    """
    Returns 'orange' if the delta-1 discrepancy is just a lone sofit,
    otherwise 'red'.

    Orange cases:
      delta == +1 : JSON has one extra word, and that extra word is a lone sofit.
      delta == -1 : CATSS has one extra token that ends with a space-joined sofit
                    (i.e. it was a merged lone final letter).
    """
    if abs(delta) != 1:
        return 'red'

    if delta == +1:
        # Find which JSON word is "extra" — check if any is a lone sofit
        return 'orange' if any(_is_lone_sofit_heb(w) for w in json_hebrew) else 'red'

    if delta == -1:
        # CATSS has one more — check if any CATSS token contains a space
        # (meaning a lone final letter was merged onto it)
        return 'orange' if any(' ' in t for t in catss_tokens) else 'red'

    return 'red'


# ─────────────────────────────────────────────────────────────────────────────
# PAR parser
# ─────────────────────────────────────────────────────────────────────────────

# Matches "Ruth 1:1", "1 Sam 3:4", "Obad 1" (single-chapter books), etc.
_VERSE_RE = re.compile(r'^.+?\s+(\d+)(?::(\d+))?\s*$')


def parse_par(par_path):
    """
    Returns {(chapter, verse): [col_a_heb_token, ...]}

    Single-chapter books (Obadiah, etc.) use "Book N" headers (no colon):
    these are mapped to chapter=1, verse=N.
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
                    a, b = m.group(1), m.group(2)
                    if b is None:
                        ch, vs = 1, int(a)   # single-chapter book
                    else:
                        ch, vs = int(a), int(b)
                    current_key = (ch, vs)
                    if current_key not in verses:
                        verses[current_key] = []
                continue

            if current_key is None:
                continue

            heb_col = line.split('\t')[0]
            s = heb_col.strip()
            if s.startswith('^ ^^^') or s == '^':
                continue

            tokens = _tokenize_par_heb(heb_col)
            verses[current_key].extend(tokens)

    return verses


# ─────────────────────────────────────────────────────────────────────────────
# JSON loader
# ─────────────────────────────────────────────────────────────────────────────

def load_json_book(book_path):
    result = {}
    for jp in sorted(book_path.glob('*.json'),
                     key=lambda p: int(p.stem) if p.stem.isdigit() else 9999):
        if not jp.stem.isdigit():
            continue
        chapter = int(jp.stem)
        with open(jp, encoding='utf-8') as fh:
            verses = json.load(fh)
        for v_idx, verse in enumerate(verses, start=1):
            result[(chapter, v_idx)] = [w['hebrew'] for w in verse.get('hebrew_words', [])]
    return result


# ─────────────────────────────────────────────────────────────────────────────
# Comparison
# ─────────────────────────────────────────────────────────────────────────────

def compare(par_verses, json_verses):
    rows = []
    for key in sorted(set(par_verses) | set(json_verses)):
        ch, vs = key
        catss_tokens = par_verses.get(key, [])
        json_hebrew  = json_verses.get(key, [])
        jc, cc = len(json_hebrew), len(catss_tokens)
        delta = jc - cc
        if delta == 0:
            status = 'green'
        else:
            status = _classify_mismatch(json_hebrew, catss_tokens, delta)

        # Render CATSS tokens as Unicode Hebrew for display
        catss_heb_display = [catss_token_to_heb(t) for t in catss_tokens]

        rows.append({
            'ref':               f'{ch}:{vs}',
            'ch': ch, 'vs': vs,
            'json_count':        jc,
            'catss_count':       cc,
            'delta':             delta,
            'catss_tokens':      catss_tokens,      # raw CATSS transliteration
            'catss_heb':         catss_heb_display, # Unicode Hebrew
            'json_hebrew':       json_hebrew,
            'status':            status,             # 'green' | 'orange' | 'red'
        })
    return rows


# ─────────────────────────────────────────────────────────────────────────────
# HTML
# ─────────────────────────────────────────────────────────────────────────────

_CSS = """
body{font-family:system-ui,sans-serif;font-size:14px;margin:2em;background:#fafafa}
h1{font-size:1.4em;margin-bottom:.3em}
h2{margin-top:1.5em;border-bottom:2px solid #ccc;padding-bottom:.2em}
.ch-summary{font-size:.9em;color:#555;margin-left:1em;font-weight:normal}
.summary{background:#fff;border:1px solid #ddd;border-radius:6px;
         padding:1em 1.5em;display:inline-block;margin-bottom:1.5em}
.stat{display:inline-block;margin-right:2em}
.stat span{font-size:1.6em;font-weight:bold}

/* verse rows */
details{margin-bottom:.3em}
summary{cursor:pointer;padding:.3em .5em;border-radius:4px;
        list-style:none;display:flex;gap:.8em;align-items:baseline;
        user-select:none}
summary::-webkit-details-marker{display:none}
summary .ref{font-weight:bold;width:4.5em;flex-shrink:0;font-family:monospace}
summary .badge{font-size:.75em;padding:2px 7px;border-radius:10px;font-weight:bold;
               flex-shrink:0}
summary .counts{color:#888;font-size:.85em}

/* status colours */
.green>summary{background:#f0faf0}
.green .badge{background:#c8efc8;color:#1a5c1a}
.orange>summary{background:#fff8e6}
.orange .badge{background:#ffe0a0;color:#7a4800}
.red>summary{background:#fff3f0}
.red .badge{background:#ffdad4;color:#8b1a00}

/* detail panel */
.detail-grid{display:grid;grid-template-columns:auto 1fr;gap:.35em .9em;
             padding:.6em 1em .7em 2.2em;background:#fff;
             border:1px solid #e0e0e0;border-top:none;
             border-radius:0 0 5px 5px}
.lbl{color:#777;font-size:.82em;white-space:nowrap;padding-top:.1em}
.heb{direction:rtl;font-size:1.15em;letter-spacing:.04em;line-height:1.7}
.trans{font-family:monospace;font-size:.85em;color:#444;line-height:1.6}

/* word chips */
.word{display:inline-block;padding:1px 5px;border-radius:3px;margin:1px 2px}
.w-ok{background:#e8f5e9}
.w-sofit{background:#fff3cd;border:1px solid #f0c040;font-weight:bold}
.w-diff{background:#fde8e4}
.w-diff-count{background:#BDED49}
.w-catss-ok{background:#e3f0ff}
.w-catss-merged{background:#fff3cd;border:1px solid #f0c040}

/* summary table */
table.sum{border-collapse:collapse;width:100%;max-width:980px}
table.sum th,table.sum td{border:1px solid #ddd;padding:.4em .7em}
table.sum th{background:#f0f0f0;text-align:left}
td.num{text-align:right}
td.pct{text-align:right;white-space:nowrap}
.bar-wrap{display:inline-block;width:90px;height:9px;background:#ddd;
          border-radius:3px;vertical-align:middle;margin-left:5px}
.bar-fill{height:9px;border-radius:3px;display:block}
.bar-green{background:#2e7d32}.bar-orange{background:#f57c00}
tr.all-ok{background:#f6fff6}
tr.has-orange{background:#fffcf0}
tr.has-red{background:#fff8f6}
a{color:#1a4b8a}
"""


def strip_hebrew_for_match(s):
    '''Lowercase-ish Hebrew comparison key: consonants only, no slash,
    collapse final letters to their non-final equivalents so ם==מ etc.'''
    out = []
    FINAL_MAP = {
        '\u05DA': '\u05DB',  # ך → כ
        '\u05DD': '\u05DE',  # ם → מ
        '\u05DF': '\u05E0',  # ן → נ
        '\u05E3': '\u05E4',  # ף → פ
        '\u05E5': '\u05E6',  # ץ → צ
    }
    for c in s:
        if '\u05D0' <= c <= '\u05EA':
            out.append(FINAL_MAP.get(c, c))
    return ''.join(out).replace('/', '')

def _word_chips(words, sofit_highlight=False, chip_cls_default='w-ok', jddit_classes=[]):
    """Render a list of Hebrew/CATSS words as coloured chips."""
    chips = []
    for w, clss in zip(words, jddit_classes):
        if sofit_highlight and _is_lone_sofit_heb(w):
            clsa = 'w-sofit'
        else:
            clsa = chip_cls_default
        chips.append(f'<span class="word {clsa} {clss}">{w}</span>')
    return ''.join(chips)


def _catss_chips(tokens, heb_display, addit_clases):
    """Render CATSS tokens as chips, highlighting diff."""
    chips = []
    for t, h, clss in zip(tokens, heb_display, addit_clases):
        chips.append(
            f'<span class="word {clss}" title="{t}">{h}</span>'
        )
    return ''.join(chips)


from collections import Counter
def _diff_chips( json_hebrew, catss_tokens, catss_heb, sofit_highlight, ok_cls):
    
    #naive diff..
    catss_heb_stripped = [strip_hebrew_for_match(h) for h in catss_heb]
    json_hebrew_stripped = [strip_hebrew_for_match(h) for h in json_hebrew]
    diff_catss_from_json = set(catss_heb_stripped) - set(json_hebrew_stripped)
    count_json = Counter(json_hebrew_stripped)
    count_catss = Counter(catss_heb_stripped)
    addit_clases = []
    for w in catss_heb_stripped:
        if w in diff_catss_from_json:
            addit_clases.append('w-diff')
        else:
            if count_json[w] > 0 :         
                addit_clases.append(ok_cls)
                count_json[w] -= 1
            else:
                addit_clases.append('w-diff-count')
    diff_json_from_catss = set(json_hebrew_stripped) - set(catss_heb_stripped)
    jddit_classes=[]
    for w in json_hebrew_stripped:
        if w in diff_json_from_catss:
            jddit_classes.append('w-diff')
        else:
            if count_catss[w] > 0 :         
                jddit_classes.append(ok_cls)
                count_catss[w] -= 1
            else:
                jddit_classes.append('w-diff-count')
    catss_chips = _catss_chips(catss_tokens, catss_heb, addit_clases)
    json_chips = _word_chips(json_hebrew, sofit_highlight=sofit_highlight, chip_cls_default=ok_cls,
    jddit_classes=jddit_classes)
    return catss_chips, json_chips


def _book_html(book, rows, par_stem):
    green_ct  = sum(1 for r in rows if r['status'] == 'green')
    orange_ct = sum(1 for r in rows if r['status'] == 'orange')
    red_ct    = sum(1 for r in rows if r['status'] == 'red')
    total     = len(rows)

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
  <div class="stat">Verses <span>{total}</span></div>
  <div class="stat"><span style="color:#2e7d32">{green_ct}</span> match</div>
  <div class="stat"><span style="color:#f57c00">{orange_ct}</span> sofit&#x2011;only</div>
  <div class="stat"><span style="color:#c00">{red_ct}</span> mismatch</div>
</div>
<p style="font-size:.85em;color:#666">
  Hover over a CATSS token chip to see its raw transliteration.
  <span style="background:#fff3cd;border:1px solid #f0c040;padding:1px 5px;border-radius:3px">orange chip</span>
  = lone sofit letter (merged in CATSS / split in JSON).
</p>
"""]

    for ch in sorted(by_ch):
        ch_rows  = by_ch[ch]
        ch_green  = sum(1 for r in ch_rows if r['status'] == 'green')
        ch_orange = sum(1 for r in ch_rows if r['status'] == 'orange')
        ch_red    = sum(1 for r in ch_rows if r['status'] == 'red')
        parts.append(
            f'<h2>Chapter {ch}'
            f'<span class="ch-summary">'
            f'<span style="color:#2e7d32">{ch_green} ok</span> &nbsp;'
            f'<span style="color:#f57c00">{ch_orange} sofit</span> &nbsp;'
            f'<span style="color:#c00">{ch_red} diff</span>'
            f'</span></h2>\n'
        )
        for r in ch_rows:
            status = r['status']
            delta  = r['delta']
            dsign  = f"+{delta}" if delta > 0 else str(delta)
            badge  = {"green": "&#10003; match",
                      "orange": f"~ sofit &Delta;{dsign}",
                      "red": f"&#10007; &Delta;{dsign}"}[status]
            open_attr = ' open' if status != 'green' else ''

            # Word chips
            catss_chips, json_chips = _diff_chips(
                r['json_hebrew'], r['catss_tokens'], r['catss_heb'], 
                sofit_highlight=(status == 'orange'),
                ok_cls='w-ok')

            parts.append(
                f'<details class="{status}"{open_attr}>\n'
                f'  <summary>'
                f'<span class="ref">{r["ref"]}</span>'
                f'<span class="badge">{badge}</span>'
                f'<span class="counts">json&nbsp;{r["json_count"]} '
                f'| catss&nbsp;{r["catss_count"]}</span>'
                f'</summary>\n'
                f'  <div class="detail-grid">'
                f'<span class="lbl">JSON Hebrew</span>'
                f'<span class="heb">{json_chips or "<em>empty</em>"}</span>'
                f'<span class="lbl">CATSS (Hebrew)</span>'
                f'<span class="heb">{catss_chips or "<em>empty</em>"}</span>'
                f'</div>\n</details>\n'
            )

    parts.append("</body></html>\n")
    return ''.join(parts)


def _summary_html(book_stats):
    covered     = [b for b in book_stats if not b.get('skipped_reason')]
    total_v     = sum(b['total']    for b in covered)
    total_green = sum(b['green']    for b in covered)
    total_orange= sum(b['orange']   for b in covered)
    total_red   = sum(b['red']      for b in covered)
    pct_g  = round(100 * total_green  / total_v, 1) if total_v else 0
    pct_go = round(100 * (total_green + total_orange) / total_v, 1) if total_v else 0

    rows_html = []
    for b in book_stats:
        if b.get('skipped_reason'):
            rows_html.append(
                f'<tr><td>{b["book"]}</td>'
                f'<td colspan="7" style="color:#aaa;font-style:italic">'
                f'{b["skipped_reason"]}</td></tr>\n'
            )
            continue
        t = b['total'] or 1
        pct_bk = round(100 * b['green'] / t, 1)
        bar_g  = round(90 * b['green']  / t)
        bar_o  = round(90 * b['orange'] / t)
        bar = (f'<span class="bar-wrap">'
               f'<span class="bar-fill bar-green" style="width:{bar_g}px;display:inline-block"></span>'
               f'<span class="bar-fill bar-orange" style="width:{bar_o}px;display:inline-block;border-radius:0 3px 3px 0"></span>'
               f'</span>')
        cls = 'all-ok' if b['red'] == 0 and b['orange'] == 0 else \
              'has-orange' if b['red'] == 0 else 'has-red'
        link = f'<a href="{b["book"]}_diff.html">{b["book"]}</a>'
        r_col = (f'<span style="color:#c00;font-weight:bold">{b["red"]}</span>'
                 if b['red'] else '0')
        o_col = (f'<span style="color:#f57c00;font-weight:bold">{b["orange"]}</span>'
                 if b['orange'] else '0')
        rows_html.append(
            f'<tr class="{cls}">'
            f'<td>{link}</td>'
            f'<td style="font-family:monospace;font-size:.85em">{b["par_stem"]}</td>'
            f'<td class="num">{b["total"]}</td>'
            f'<td class="num" style="color:#2e7d32">{b["green"]}</td>'
            f'<td class="num">{o_col}</td>'
            f'<td class="num">{r_col}</td>'
            f'<td class="pct">{pct_bk}%{bar}</td>'
            f'</tr>\n'
        )

    return f"""<!DOCTYPE html><html lang="en"><head>
<meta charset="utf-8">
<title>Hebrew count diff - All books</title>
<style>{_CSS}</style></head><body>
<h1>Hebrew word count diff &mdash; All books</h1>
<div class="summary">
  <div class="stat">Books <span>{len(covered)}</span></div>
  <div class="stat">Verses <span>{total_v:,}</span></div>
  <div class="stat"><span style="color:#2e7d32">{total_green:,}</span> match</div>
  <div class="stat"><span style="color:#f57c00">{total_orange:,}</span> sofit&#x2011;only</div>
  <div class="stat"><span style="color:#c00">{total_red:,}</span> mismatch</div>
  <div class="stat">Exact match <span style="color:#2e7d32">{pct_g}%</span></div>
  <div class="stat">incl. sofit <span style="color:#f57c00">{pct_go}%</span></div>
</div>
<table class="sum">
<tr><th>Book</th><th>PAR stem</th>
    <th class="num">Verses</th><th class="num" style="color:#2e7d32">Match</th>
    <th class="num" style="color:#f57c00">Sofit</th>
    <th class="num" style="color:#c00">Diff</th>
    <th>Match %</th></tr>
{''.join(rows_html)}
</table>
</body></html>
"""


# ─────────────────────────────────────────────────────────────────────────────
# Text console report
# ─────────────────────────────────────────────────────────────────────────────

def print_text_report(book, rows):
    green_ct  = sum(1 for r in rows if r['status'] == 'green')
    orange_ct = sum(1 for r in rows if r['status'] == 'orange')
    red_ct    = sum(1 for r in rows if r['status'] == 'red')
    total = len(rows)
    pct = round(100 * green_ct / total, 1) if total else 0
    print(f"  {book:22s}  {total:5d} verses  "
          f"{pct:5.1f}% match  {orange_ct} sofit  {red_ct} diff")
    for r in rows:
        if r['status'] == 'green':
            continue
        sym = '~' if r['status'] == 'orange' else '!'
        dsign = f"+{r['delta']}" if r['delta'] > 0 else str(r['delta'])
        j_p = '  '.join(r['json_hebrew'][:6]) + ('  ...' if len(r['json_hebrew']) > 6 else '')
        c_p = '  '.join(r['catss_tokens'][:6]) + ('  ...' if len(r['catss_tokens']) > 6 else '')
        print(f"  {sym} {r['ref']:8s} json={r['json_count']:3d} catss={r['catss_count']:3d} d={dsign:>3s}")
        print(f"              json : {j_p}")
        print(f"              catss: {c_p}")


# ─────────────────────────────────────────────────────────────────────────────
# Single-book mode
# ─────────────────────────────────────────────────────────────────────────────

def run_single(args):
    par_path   = Path(args.par)
    json_paths = [Path(p) for p in args.json]
    out_path   = Path(args.out) if args.out else None

    print(f"Parsing PAR: {par_path}")
    par_verses = remapp(parse_par(par_path), args.book)
    print(f"  -> {len(par_verses)} verses")

    json_verses = {}
    for jp in sorted(json_paths, key=lambda p: int(p.stem) if p.stem.isdigit() else 9999):
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
        out_path.write_text(_book_html(args.book, rows, par_path.stem), encoding='utf-8')
        print(f"\nHTML report -> {out_path}")


# ─────────────────────────────────────────────────────────────────────────────
# Full-bible mode
# ─────────────────────────────────────────────────────────────────────────────

def run_full(args):
    par_dir   = Path(os.path.expanduser(args.par_dir))
    bible_dir = Path(os.path.expanduser(args.bible_dir))
    out_dir   = Path(os.path.expanduser(args.out_dir))
    out_dir.mkdir(parents=True, exist_ok=True)

    books = sorted(d.name for d in bible_dir.iterdir()
                   if d.is_dir() and d.name != 'excel')
    print(f"Found {len(books)} book folders in {bible_dir}")
    print(f"PAR dir : {par_dir}\nOut dir : {out_dir}\n")

    book_stats = []

    for book in books:
        if book != "psalms":
            continue
        if book not in BIBLE_TO_CATSS:
            print(f"skip  {book}: no CATSS mapping")
            book_stats.append({'book': book, 'par_stem': '-',
                                'total': 0, 'green': 0, 'orange': 0, 'red': 0,
                                'skipped_reason': 'no CATSS mapping'})
            continue

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
                                'total': 0, 'green': 0, 'orange': 0, 'red': 0,
                                'skipped_reason': 'no .par file'})
            continue

        json_verses = load_json_book(bible_dir / book)
        if not json_verses:
            print(f"miss  {book}: no JSON files")
            book_stats.append({'book': book, 'par_stem': par_stem,
                                'total': 0, 'green': 0, 'orange': 0, 'red': 0,
                                'skipped_reason': 'no JSON files'})
            continue

        par_verses = remapp(parse_par(par_path), book)
        rows       = compare(par_verses, json_verses)

        green_ct  = sum(1 for r in rows if r['status'] == 'green')
        orange_ct = sum(1 for r in rows if r['status'] == 'orange')
        red_ct    = sum(1 for r in rows if r['status'] == 'red')

        print_text_report(book, rows)
        (out_dir / f"{book}_diff.html").write_text(
            _book_html(book, rows, par_stem), encoding='utf-8'
        )

        book_stats.append({
            'book': book, 'par_stem': par_stem,
            'total': len(rows),
            'green': green_ct, 'orange': orange_ct, 'red': red_ct,
            'skipped_reason': None,
        })

    summary_path = out_dir / "00_summary.html"
    summary_path.write_text(_summary_html(book_stats), encoding='utf-8')

    covered     = [b for b in book_stats if not b.get('skipped_reason')]
    total_v     = sum(b['total']  for b in covered)
    total_green = sum(b['green']  for b in covered)
    total_red   = sum(b['red']    for b in covered)
    total_orange= sum(b['orange'] for b in covered)
    pct = round(100 * total_green / total_v, 1) if total_v else 0

    print(f"\n{'='*62}")
    print(f"  Books: {len(covered)}  Verses: {total_v:,}  "
          f"Match: {total_green:,}  Sofit: {total_orange:,}  Diff: {total_red:,}  ({pct}%)")
    print(f"  Summary  -> {summary_path}")
    print(f"{'='*62}")


# ─────────────────────────────────────────────────────────────────────────────
# CLI
# ─────────────────────────────────────────────────────────────────────────────

def main():
    ap = argparse.ArgumentParser(
        description="Compare Hebrew word counts: JSON dataset vs CATSS .par"
    )
    ap.add_argument('--par',        help="[single] .par file path")
    ap.add_argument('--json',       nargs='+', help="[single] chapter JSON files")
    ap.add_argument('--book',       help="[single] book name for report title")
    ap.add_argument('--out',        help="[single] output HTML path")
    ap.add_argument('--par-dir',    help="[full] directory with *.par files")
    ap.add_argument('--bible-dir',  help="[full] directory with book sub-folders")
    ap.add_argument('--out-dir',    help="[full] output directory for HTML reports")
    args = ap.parse_args()
    
    args = ap.parse_args([
        '--par-dir', 'B:/m_penn/ccat_archive/gopher/text/religion/biblical/parallel',
        '--bible-dir', '../bible',
        '--out-dir', 'heb_count_reports'
    ])
    if args.par_dir and args.bible_dir and args.out_dir:
        run_full(args)
    elif args.par and args.json and args.book:
        run_single(args)
    else:
        ap.print_help()
        sys.exit(1)


if __name__ == '__main__':
    main()
