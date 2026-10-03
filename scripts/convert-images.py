#!/usr/bin/env python3
"""Convert scene PNGs (and the fallback backdrop) to the WebP files the app loads.

Usage: python3 scripts/convert-images.py
Needs Pillow with WebP support (pip install --user pillow). Keeps the PNG masters
in place; the app only references the .webp files. Images wider than 1600px are
scaled down to 1600px first.
"""

import glob
import os

from PIL import Image

MAX_WIDTH = 1600
QUALITY = 82

files = sorted(glob.glob("public/assets/scenes/*/*.png")) + ["public/assets/cafe-room.png"]
total_in = total_out = 0
for path in files:
    image = Image.open(path).convert("RGB")
    width, height = image.size
    if width > MAX_WIDTH:
        image = image.resize((MAX_WIDTH, round(height * MAX_WIDTH / width)), Image.LANCZOS)
    out = os.path.splitext(path)[0] + ".webp"
    image.save(out, "WEBP", quality=QUALITY, method=6)
    size_in, size_out = os.path.getsize(path), os.path.getsize(out)
    total_in += size_in
    total_out += size_out
    print(f"{size_out / 1024:7.0f} KB  {image.size[0]}x{image.size[1]}  {out}")

print(f"total {total_in / 1e6:.1f} MB -> {total_out / 1e6:.1f} MB")
