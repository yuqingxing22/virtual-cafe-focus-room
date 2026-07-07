#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NODE_VERSION="v22.12.0"
NODE_PLATFORM=""

case "$(uname -s)-$(uname -m)" in
  Darwin-arm64)
    NODE_PLATFORM="darwin-arm64"
    ;;
  Darwin-x86_64)
    NODE_PLATFORM="darwin-x64"
    ;;
  Linux-x86_64)
    NODE_PLATFORM="linux-x64"
    ;;
  Linux-aarch64|Linux-arm64)
    NODE_PLATFORM="linux-arm64"
    ;;
  *)
    echo "Unsupported platform: $(uname -s)-$(uname -m)" >&2
    exit 1
    ;;
esac

NODE_DIR="$ROOT_DIR/.local/node-$NODE_VERSION-$NODE_PLATFORM"
NODE_TAR="$ROOT_DIR/.local/node-$NODE_VERSION-$NODE_PLATFORM.tar.gz"

mkdir -p "$ROOT_DIR/.local"

if [ ! -x "$NODE_DIR/bin/node" ]; then
  echo "Downloading Node.js $NODE_VERSION for $NODE_PLATFORM..."
  curl -fsSL "https://nodejs.org/dist/$NODE_VERSION/node-$NODE_VERSION-$NODE_PLATFORM.tar.gz" -o "$NODE_TAR"
  tar -xzf "$NODE_TAR" -C "$ROOT_DIR/.local"
fi

export PATH="$NODE_DIR/bin:$PATH"
cd "$ROOT_DIR"

if [ ! -d node_modules ]; then
  npm install
fi

npm run dev -- --host 127.0.0.1 --port 5173
