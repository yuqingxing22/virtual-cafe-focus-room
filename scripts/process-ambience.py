#!/usr/bin/env python3
"""Build the ambience tracks the site plays from the licensed source recordings.

Usage (from the project root): python3 scripts/process-ambience.py
Needs ffmpeg (brew install ffmpeg). Sources live in freesound/ and pixabay/, which are
not in git; see docs/audio-credits.md for where each one came from and its licence.

Each recipe trims the source, applies a fixed gain so the new track sits at the same level
as the recording it replaces (seat presets then need no retuning), and blends the first
few seconds into the end so the loop point is inaudible. Output is 128 kbps CBR MP3.
"""
import os
import subprocess
import sys

FFMPEG = "/opt/homebrew/bin/ffmpeg" if os.path.exists("/opt/homebrew/bin/ffmpeg") else "ffmpeg"
OUT = "public/audio"

# name, source, start (s), end (s, None = to the end; negative = seconds before the end),
# gain (dB), crossfade (s; 0 = plain short fades, for sparse sounds)
RECIPES = [
    # Cafe chatter. Reference level: the old cafe-ambience.mp3.
    ("cafe-morning.mp3", "freesound/cafe-coffee-shop-fs562863.m4a", 4, None, -2.3, 6),
    ("cafe-day.mp3", "freesound/cafe-seoul-fs770433.mp3", 8, -30, -4.1, 6),  # skip a bump at 5 s and 30 s of harsh handling noise at the end
    ("cafe-night.mp3", "freesound/cafe-crowded-fs732984.wav", 0, None, 5.2, 6),
    # Rain. rain-light sits about 6 dB under rain-day on purpose.
    ("rain-day.mp3", "freesound/rain-under-tree-fs102674.mp3", 0, None, 0.5, 6),
    ("rain-light.mp3", "pixabay/rain-relaxing-px444802.mp3", 71, 700, 13.4, 6),  # skip the fade-in and fade-out
    # Street.
    ("street-day.mp3", "pixabay/street-busy-px195884.mp3", 0, None, 7.5, 6),  # horns are caught by the limiter
    ("street-light.mp3", "freesound/street-morning-city-fs720042.mp3", 0, 1200, -8.0, 6),  # first 20 min: no loud events
    # Morning birds: the first 45 minutes.
    ("birds-morning.mp3", "freesound/birds-morning-park-fs839784.wav", 0, 2700, -5.0, 6),
    # Typing: sparse, so plain fades instead of a crossfade. Matches the old typing.mp3 at its 90th percentile.
    ("typing-keys.mp3", "freesound/typing-mechanical-fs399603.wav", 6, -4, -5.0, 0),
]


def duration(path):
    out = subprocess.run(
        [FFMPEG.replace("ffmpeg", "ffprobe"), "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
        capture_output=True, text=True,
    ).stdout.strip()
    return float(out)


def build(name, source, start, end, gain, xfade):
    total = duration(source)
    stop = total if end is None else (total + end if end < 0 else end)
    trim = f"atrim={start}:{stop},asetpts=PTS-STARTPTS,volume={gain}dB"
    if xfade:
        graph = (
            f"[0:a]{trim},asplit[x][y];"
            f"[x]atrim=start={xfade},asetpts=PTS-STARTPTS[main];"
            f"[y]atrim=0:{xfade},asetpts=PTS-STARTPTS[head];"
            f"[main][head]acrossfade=d={xfade}:c1=tri:c2=tri,alimiter=limit=0.89[out]"
        )
    else:
        length = stop - start
        graph = f"[0:a]{trim},afade=t=in:d=0.5,afade=t=out:st={length - 1.5}:d=1.5,alimiter=limit=0.89[out]"
    dest = f"{OUT}/{name}"
    subprocess.run(
        [FFMPEG, "-v", "error", "-y", "-i", source, "-filter_complex", graph, "-map", "[out]",
         "-ar", "44100", "-c:a", "libmp3lame", "-b:a", "128k", "-map_metadata", "-1", dest],
        check=True,
    )
    print(f"{name:20} {duration(dest) / 60:6.1f} min {os.path.getsize(dest) / 1e6:6.1f} MB  <- {source} [{start}s to {stop:.0f}s, {gain:+.1f} dB]", flush=True)


if __name__ == "__main__":
    only = set(sys.argv[1:])
    os.makedirs(OUT, exist_ok=True)
    for recipe in RECIPES:
        if not only or recipe[0] in only:
            build(*recipe)
