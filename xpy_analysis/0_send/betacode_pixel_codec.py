"""
betacode_pixel_codec.py
=======================

Hide a text payload (CCAT Beta Code, plus regular ASCII letters/digits/
punctuation) inside a PNG image by writing one character per pixel into
the **red channel only** — green and blue stay untouched.

Layout
------
- 3-pixel header: each pixel's red channel = 128 (mid-grey marker).
- N data pixels: each pixel's red channel encodes one character of the
  payload.
- 3-pixel sentinel: red = 128 again, marks end of payload.

Encoding table
--------------
The alphabet is built deterministically (see ``build_alphabet()``) from:
- ASCII space  (the midpoint, value 128)
- Beta-code Greek letters: A B G D E Z H Q I K L M N C O P R S J T U F V W X Y
- Lowercase Latin a..z
- Digits 0..9
- Beta diacritics: )  (  /  \\  =  +  |  *
- Structural & annotation marks: # & $ ' " : ; - . , ? ! ~ ^ < > _ { } [ ]
- Tab and newline (so whole .par files round-trip).

Halves are split as you specified:
    "Above 128 = first half (going up: 129, 130, ...)
     Below 128 = second half (going down: 127, 126, ...)
     Closer-to-128 = earlier in alphabet."

So the first character of the alphabet (after space) becomes 129, the
second becomes 127, the third 130, the fourth 126, and so on, zig-zagging
outward from 128.

Why PNG and not JPG/GIF
-----------------------
- JPG: lossy — discards exact pixel values; not usable.
- GIF: paletted; would require constructing a custom palette that
  includes every encoded colour, otherwise Pillow quantises and corrupts
  the values. Doable but fragile.
- PNG in mode 'RGB': lossless, exact round-trip. We use this.
- BMP would also work; PNG is just smaller on disk.

Usage
-----
    from betacode_pixel_codec import encode_into_png, decode_from_png

    encode_into_png('cover.png', 'TH\\N PRW/THN', 'out.png')
    text = decode_from_png('out.png')   # -> 'TH\\N PRW/THN'
"""

from PIL import Image


# ─── alphabet construction ───────────────────────────────────────────────────

def build_alphabet():
    """
    Deterministic ordered list of characters that can be encoded.
    Position 0 is reserved for SPACE (encodes to value 128).
    Subsequent characters take values that zig-zag outward from 128.
    """
    seen = set()
    alphabet = []

    def add(s):
        for c in s:
            if c not in seen:
                seen.add(c)
                alphabet.append(c)

    add(' ')                                            # midpoint

    # CCAT Beta Code Greek letters (incl. final sigma 'J' and digamma 'V')
    add('ABGDEZHQIKLMNCOPRSJTUFVWXY')

    # Lowercase Latin
    add('abcdefghijklmnopqrstuvwxyz')

    # Digits
    add('0123456789')

    # Beta-code diacritics
    add(')(/\\=+|*')

    # Structural / annotation marks used in CCAT files
    add('#&$\'":;-.,?!~^<>_{}[]')

    # Whitespace control chars so whole .par files round-trip
    add('\t\n')

    return alphabet


_ALPHABET = build_alphabet()


def _build_codec_tables():
    """
    Return (char_to_byte, byte_to_char) implementing the zig-zag layout:
      idx 0 -> 128  (space)
      idx 1 -> 129  (first half, 1 above)
      idx 2 -> 127  (second half, 1 below)
      idx 3 -> 130
      idx 4 -> 126
      ...
    """
    char_to_byte = {}
    byte_to_char = {}

    for i, ch in enumerate(_ALPHABET):
        if i == 0:
            val = 128
        elif i % 2 == 1:
            # odd index -> first half, going up from 128
            val = 128 + (i + 1) // 2
        else:
            # even index -> second half, going down from 128
            val = 128 - i // 2

        if not (0 <= val <= 255):
            raise ValueError(
                f'Alphabet too large: char {ch!r} at index {i} would map '
                f'to byte value {val}, outside 0..255.'
            )
        char_to_byte[ch] = val
        byte_to_char[val] = ch

    return char_to_byte, byte_to_char


_C2B, _B2C = _build_codec_tables()


# ─── public API ──────────────────────────────────────────────────────────────

def encode_into_png(cover_path, payload, out_path):
    """
    Open ``cover_path`` (any image Pillow can read), embed ``payload``
    into its red channel, save as PNG to ``out_path``. The cover image
    must be at least (3 + len(payload) + 3) pixels in total.

    Returns the number of pixels written (header + payload + sentinel).
    """
    img = Image.open(cover_path).convert('RGB')
    w, h = img.size
    total_pixels = w * h
    needed = 3 + len(payload) + 3
    if total_pixels < needed:
        raise ValueError(
            f'Image too small: have {total_pixels} pixels, need {needed} '
            f'(3 header + {len(payload)} payload + 3 sentinel).'
        )

    pixels = list(img.getdata())          # list of (r, g, b) tuples

    pos = 0

    # 3-pixel header: r = 128, leave g/b alone
    for _ in range(3):
        r, g, b = pixels[pos]
        pixels[pos] = (128, g, b)
        pos += 1

    # payload
    for ch in payload:
        if ch not in _C2B:
            raise ValueError(
                f'Character {ch!r} (U+{ord(ch):04X}) is not in the '
                f'encodable alphabet. See build_alphabet().'
            )
        r, g, b = pixels[pos]
        pixels[pos] = (_C2B[ch], g, b)
        pos += 1

    # 3-pixel sentinel: r = 128 again
    for _ in range(3):
        r, g, b = pixels[pos]
        pixels[pos] = (128, g, b)
        pos += 1

    img.putdata(pixels)
    img.save(out_path, format='PNG')
    return needed


def decode_from_png(path):
    """
    Inverse of encode_into_png. Reads ``path``, finds the 3-pixel header
    of red==128, decodes characters until the 3-pixel sentinel of
    red==128, returns the payload string.
    """
    img = Image.open(path).convert('RGB')
    pixels = list(img.getdata())

    # locate header: first run of >=3 consecutive pixels with r == 128
    n = len(pixels)
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
        raise ValueError('No 3-pixel header (r==128) found in image.')

    # walk forward from after the header looking for the next 3-run of r==128
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
                f'Pixel at offset {pos} has red value {r0}, which is not '
                f'in the decoding table.'
            )
        out_chars.append(_B2C[r0])
        pos += 1

    # ran off the end without hitting a sentinel — bail with what we have
    raise ValueError('No 3-pixel sentinel (r==128) found before end of image.')


# ─── self-test ───────────────────────────────────────────────────────────────

if __name__ == '__main__':
    import os, tempfile

    # Show the codec table
    print(f'Alphabet size: {len(_ALPHABET)}')
    print('First 10 entries (idx, char, byte):')
    for i, ch in enumerate(_ALPHABET[:10]):
        print(f'  {i:3d}  {ch!r:6s}  {_C2B[ch]:4d}')

    print(f'\nByte range used: {min(_B2C):d} .. {max(_B2C):d} '
          f'(midpoint 128, alphabet has {len(_ALPHABET)} chars)\n')

    # Round-trip the user's earlier sample (Beta Code form)
    sample = (
        'O(/TI TH\\N A)GA/PHN SOU TH\\N PRW/THN A)FH=KEJ MNHMO/NEUE OU)=N '
        'PO/QEN PE/PTWKAJ KAI\\ METANO/HSON KAI\\ TA\\ PRW=TA E)/RGA POI/HSON'
    )

    # make a tiny test cover image
    cover = Image.new('RGB', (32, 32), (200, 100, 50))   # solid coloured
    tmpdir = tempfile.mkdtemp()
    cover_path = os.path.join(tmpdir, 'cover.png')
    out_path   = os.path.join(tmpdir, 'stego.png')
    cover.save(cover_path)

    written = encode_into_png(cover_path, sample, out_path)
    decoded = decode_from_png(out_path)

    print(f'INPUT     ({len(sample):3d} chars): {sample}')
    print(f'DECODED   ({len(decoded):3d} chars): {decoded}')
    print(f'PIXELS WRITTEN: {written}  (header 3 + payload {len(sample)} + sentinel 3)')
    print(f'EXACT MATCH? {decoded == sample}')

    # confirm green/blue untouched
    orig = list(Image.open(cover_path).convert('RGB').getdata())
    stego = list(Image.open(out_path).convert('RGB').getdata())
    gb_intact = all(o[1:] == s[1:] for o, s in zip(orig, stego))
    r_changed = sum(1 for o, s in zip(orig, stego) if o[0] != s[0])
    print(f'GREEN/BLUE UNTOUCHED? {gb_intact}')
    print(f'RED PIXELS CHANGED:   {r_changed}  (expected up to {written})')
