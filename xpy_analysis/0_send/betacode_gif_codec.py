"""
betacode_gif_codec.py
=====================

GIF steganography for CCAT Beta Code (and ASCII letters/digits/punctuation).

Idea
----
Same character → byte mapping as the PNG codec (see
``betacode_pixel_codec.py``). Hide one character per pixel in the **red
channel only**, leaving G/B alone — so the picture stays close to the
original visually.

The wrinkle with GIF is that it's paletted: every pixel is an index into
a palette of up to 256 (R,G,B) entries. To embed a character, we need
the pixel's *displayed* RGB to be ``(encoded_R, original_G, original_B)``.

Strategy
--------
1. Open the cover image, convert to GIF-compatible 'P' mode (256-colour
   palette). If it already has fewer than 256 entries we keep them; if
   it has more (RGB cover), Pillow quantises it down.
2. Walk the embed region:
   - For each text pixel, compute the desired RGB
     ``(encoded_R, original_G, original_B)``.
   - If the palette already contains that RGB, reuse that entry's index.
   - Otherwise, add a new entry to the palette and use that.
3. If the palette overflows 256 entries, quantise the cover to a
   smaller initial palette (262 - alphabet_size) and retry. As you noted,
   the goal is **lossless encode/decode** — the cover may end up with a
   reduced colour count or with R-channel variants showing through.
4. Save as GIF. Pillow may renumber indices on save, but that's fine:
   the decoder reads RGB values, not indices.

Header / sentinel
-----------------
- 3-pixel header: red channel forced to 128, G/B kept from the cover.
- 3-pixel sentinel after payload: same convention.

Decoding scans for the first 3-pixel run of R==128 (header), then
reads each subsequent pixel's R value, looking up the character, until
it hits the next 3-pixel run of R==128 (sentinel).
"""

from PIL import Image
from betacode_pixel_codec import _C2B, _B2C, _ALPHABET   # reuse the table


# ─── helpers ─────────────────────────────────────────────────────────────────

def _palette_as_list(pal_bytes):
    """Slice a flat palette (length = 3 * N) into [(r,g,b), (r,g,b), ...]."""
    return [tuple(pal_bytes[i:i+3]) for i in range(0, len(pal_bytes), 3)]


def _list_as_palette(triples):
    """Inverse of _palette_as_list. Pads to 256 entries with (0,0,0)."""
    flat = []
    for t in triples:
        flat.extend(t)
    # pad to 256 entries (768 bytes) — required by GIF/PIL palette format
    while len(flat) < 768:
        flat.extend([0, 0, 0])
    return flat[:768]


def _quantise_to_n_colours(rgb_img, n):
    """Pillow median-cut quantise to ``n`` distinct colours, return P-mode."""
    return rgb_img.quantize(colors=n, method=Image.Quantize.MEDIANCUT)


# ─── public API ──────────────────────────────────────────────────────────────

def encode_into_gif(cover_path, payload, out_path):
    """
    Embed ``payload`` into the red channel of ``cover_path``, save as GIF
    to ``out_path``. The cover image must be at least
    (3 + len(payload) + 3) pixels in total.

    Strategy: reuse / extend the cover's palette so each text pixel's
    displayed colour becomes (encoded_R, original_G, original_B). If the
    palette overflows 256 entries the cover is requantised to a smaller
    base palette.

    Returns the number of pixels written (header + payload + sentinel).
    """
    needed = 3 + len(payload) + 3
    cover_rgb = Image.open(cover_path).convert('RGB')
    w, h = cover_rgb.size
    if w * h < needed:
        raise ValueError(
            f'Image too small: {w*h} pixels, need {needed} '
            f'(3 header + {len(payload)} payload + 3 sentinel).'
        )

    # validate payload characters early
    for ch in payload:
        if ch not in _C2B:
            raise ValueError(
                f'Character {ch!r} (U+{ord(ch):04X}) is not in the '
                f'encodable alphabet.'
            )

    # ── try with progressively smaller base palettes until the embed fits ──
    for base_palette_size in (256, 192, 128, 96, 64, 48, 32):
        try:
            return _embed_with_base_palette(
                cover_rgb, payload, out_path, base_palette_size
            )
        except _PaletteOverflow:
            continue

    raise RuntimeError(
        'Could not embed payload: palette overflow even at 32 base colours. '
        'Cover image and payload combination is too varied for GIF.'
    )


class _PaletteOverflow(Exception):
    pass


def _embed_with_base_palette(cover_rgb, payload, out_path, base_palette_size):
    """
    One embed attempt with a fixed base-palette colour count. Raises
    _PaletteOverflow if the palette would exceed 256 entries.
    """
    needed = 3 + len(payload) + 3

    # quantise the cover to N colours so we have headroom for R-variants
    pim = _quantise_to_n_colours(cover_rgb, base_palette_size)
    pal = _palette_as_list(bytes(pim.palette.palette))[:base_palette_size]
    pixels = list(pim.getdata())   # list of palette indices

    # palette as a dict: (r,g,b) -> index, for fast reuse lookups
    rgb_to_idx = {}
    for i, rgb in enumerate(pal):
        rgb_to_idx.setdefault(rgb, i)

    def get_or_add(rgb):
        """Return palette index for ``rgb``, adding a new entry if needed."""
        if rgb in rgb_to_idx:
            return rgb_to_idx[rgb]
        if len(pal) >= 256:
            raise _PaletteOverflow()
        new_idx = len(pal)
        pal.append(rgb)
        rgb_to_idx[rgb] = new_idx
        return new_idx

    # walk the embed region
    pos = 0

    # 3-pixel header: force R=128 only
    for _ in range(3):
        old_rgb = pal[pixels[pos]]
        new_rgb = (128, old_rgb[1], old_rgb[2])
        pixels[pos] = get_or_add(new_rgb)
        pos += 1

    # payload
    for ch in payload:
        old_rgb = pal[pixels[pos]]
        new_rgb = (_C2B[ch], old_rgb[1], old_rgb[2])
        pixels[pos] = get_or_add(new_rgb)
        pos += 1

    # 3-pixel sentinel
    for _ in range(3):
        old_rgb = pal[pixels[pos]]
        new_rgb = (128, old_rgb[1], old_rgb[2])
        pixels[pos] = get_or_add(new_rgb)
        pos += 1

    # rebuild a P-mode image with the (possibly extended) palette
    out_img = Image.new('P', cover_rgb.size)
    out_img.putpalette(_list_as_palette(pal))
    out_img.putdata(pixels)
    out_img.save(out_path, format='GIF')

    return needed


def decode_from_gif(path):
    """
    Inverse of encode_into_gif. Decoder reads the *displayed* RGB at each
    pixel (palette index resolved through whatever palette the file ended
    up with) and looks up the red channel in the codec table.
    """
    img = Image.open(path).convert('RGB')   # resolve palette to RGB
    pixels = list(img.getdata())
    n = len(pixels)

    # header: first run of >=3 consecutive pixels with r == 128
    header_start = None
    run = 0
    for i, (r, _g, _b) in enumerate(pixels):
        if r == 128:
            run += 1
            if run >= 3:
                header_start = i - 2
                break
        else:
            run = 0
    if header_start is None:
        raise ValueError('No 3-pixel header (R==128) found in GIF.')

    pos = header_start + 3
    out_chars = []
    while pos + 2 < n:
        r0 = pixels[pos][0]
        r1 = pixels[pos + 1][0]
        r2 = pixels[pos + 2][0]
        if r0 == 128 and r1 == 128 and r2 == 128:
            return ''.join(out_chars)
        if r0 not in _B2C:
            raise ValueError(
                f'Pixel at offset {pos} has R={r0}, not in decoding table.'
            )
        out_chars.append(_B2C[r0])
        pos += 1

    raise ValueError('No 3-pixel sentinel found before end of GIF.')


# ─── self-test ───────────────────────────────────────────────────────────────

if __name__ == '__main__':
    import os, tempfile
    from PIL import Image as _I

    sample = (
        'O(/TI TH\\N A)GA/PHN SOU TH\\N PRW/THN A)FH=KEJ MNHMO/NEUE OU)=N '
        'PO/QEN PE/PTWKAJ KAI\\ METANO/HSON KAI\\ TA\\ PRW=TA E)/RGA POI/HSON'
    )

    tmpdir = tempfile.mkdtemp()
    cover_path = os.path.join(tmpdir, 'cover.png')
    out_path   = os.path.join(tmpdir, 'stego.gif')

    # --- test 1: small flat-coloured cover (easy case) ---
    flat_cover = _I.new('RGB', (32, 32), (200, 100, 50))
    flat_cover.save(cover_path)

    written = encode_into_gif(cover_path, sample, out_path)
    decoded = decode_from_gif(out_path)
    print(f'== Test 1: flat-coloured cover ==')
    print(f'  payload:  ({len(sample):3d} chars) {sample[:60]}...')
    print(f'  decoded:  ({len(decoded):3d} chars) {decoded[:60]}...')
    print(f'  pixels written: {written}')
    print(f'  EXACT MATCH? {decoded == sample}')

    # palette inspection
    final = _I.open(out_path)
    final_rgb = final.convert('RGB')
    pal = final.getpalette()
    n_pal_entries = len([1 for i in range(0, len(pal), 3)
                         if pal[i:i+3] != [0,0,0]] or [None])
    print(f'  GIF palette entries (non-zero):  ~{n_pal_entries}')
    print(f'  GIF size: {os.path.getsize(out_path)} bytes')
    print()

    # --- test 2: complex photographic-ish cover ---
    import math
    complex_cover = _I.new('RGB', (200, 200))
    cdata = []
    for y in range(200):
        for x in range(200):
            r = int((x + y) % 256)
            g = int(127 + 127 * math.sin(x * 0.05))
            b = int(127 + 127 * math.cos(y * 0.07))
            cdata.append((r, g, b))
    complex_cover.putdata(cdata)
    complex_cover_path = os.path.join(tmpdir, 'complex.png')
    complex_cover.save(complex_cover_path)

    out2_path = os.path.join(tmpdir, 'stego2.gif')
    written2 = encode_into_gif(complex_cover_path, sample, out2_path)
    decoded2 = decode_from_gif(out2_path)
    print(f'== Test 2: complex cover (varied colours) ==')
    print(f'  decoded matches: {decoded2 == sample}')
    print(f'  pixels written: {written2}')
    print()

    # --- test 3: round-trip the entire alphabet to make sure no chars break ---
    full_msg = ''.join(_ALPHABET[1:])  # skip space (special: it's the 0 idx)
    full_msg = ' '.join(full_msg)      # interleave spaces just for fun
    cover3 = _I.new('RGB', (40, 40), (50, 200, 150))
    cover3_path = os.path.join(tmpdir, 'cover3.png')
    cover3.save(cover3_path)
    out3_path = os.path.join(tmpdir, 'stego3.gif')
    encode_into_gif(cover3_path, full_msg, out3_path)
    decoded3 = decode_from_gif(out3_path)
    print(f'== Test 3: every character in the alphabet ==')
    print(f'  alphabet length: {len(_ALPHABET)}')
    print(f'  test message length: {len(full_msg)}')
    print(f'  decoded matches: {decoded3 == full_msg}')
    if decoded3 != full_msg:
        # show first difference
        for i in range(min(len(decoded3), len(full_msg))):
            if decoded3[i] != full_msg[i]:
                print(f'    first diff at {i}: want {full_msg[i]!r}, got {decoded3[i]!r}')
                break

    # --- test 4: tiny image, exactly large enough ---
    tiny_msg = 'TEST'
    tiny_cover = _I.new('RGB', (5, 2), (80, 90, 100))   # 10 px, need 3+4+3=10
    tiny_path = os.path.join(tmpdir, 'tiny.png')
    tiny_cover.save(tiny_path)
    tiny_out = os.path.join(tmpdir, 'tiny.gif')
    encode_into_gif(tiny_path, tiny_msg, tiny_out)
    print()
    print(f'== Test 4: tiny exact-fit cover ==')
    print(f'  decoded: {decode_from_gif(tiny_out)!r}  (want {tiny_msg!r})')
