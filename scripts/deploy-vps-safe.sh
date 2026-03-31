#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SERVER_DIR="$PROJECT_ROOT/server"
APP_NAME="rahekaba-api"
ECOSYSTEM_FILE="$PROJECT_ROOT/ecosystem.config.cjs"

echo "[1/6] Pulling latest code for Rahe Kaba only..."
git -C "$PROJECT_ROOT" pull --ff-only origin main

echo "[2/6] Installing frontend dependencies for this project only..."
npm --prefix "$PROJECT_ROOT" install

echo "[3/6] Installing backend dependencies for this project only..."
npm --prefix "$SERVER_DIR" install

echo "[4/6] Building frontend..."
npm --prefix "$PROJECT_ROOT" run build

echo "[5/6] Reloading PM2 process with project-specific cwd/env..."
if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
  pm2 restart "$ECOSYSTEM_FILE" --only "$APP_NAME" --update-env
else
  pm2 start "$ECOSYSTEM_FILE" --only "$APP_NAME" --update-env
fi

echo "[6/6] Saving PM2 process list..."
pm2 save

echo "Done. Only $APP_NAME was updated."