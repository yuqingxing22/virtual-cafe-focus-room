#!/usr/bin/env bash
set -euo pipefail

bucket="${1:-}"

if [[ -z "$bucket" ]]; then
  echo "Usage: $0 <r2-bucket-name>" >&2
  exit 1
fi

if [[ ! -d public/audio ]]; then
  echo "public/audio does not exist" >&2
  exit 1
fi

content_type_for() {
  case "$1" in
    *.mp3) echo "audio/mpeg" ;;
    *.m4a) echo "audio/mp4" ;;
    *.wav) echo "audio/wav" ;;
    *.ogg) echo "audio/ogg" ;;
    *) echo "application/octet-stream" ;;
  esac
}

find public/audio -type f | sort | while IFS= read -r file; do
  key="${file#public/}"
  content_type="$(content_type_for "$file")"
  echo "Uploading $file -> r2://$bucket/$key"
  npx wrangler r2 object put "$bucket/$key" \
    --file "$file" \
    --content-type "$content_type" \
    --cache-control "public, max-age=31536000, immutable" \
    --remote \
    --force
done
