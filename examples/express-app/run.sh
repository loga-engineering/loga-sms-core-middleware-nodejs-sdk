#!/usr/bin/env bash
set -euo pipefail

echo "=== Loga SMS Node.js Integration Sample ==="

# 1. Copy environment if not present
if [ ! -f .env ]; then
    cp .env.example .env
    echo "[INFO] .env created from .env.example — edit it with your credentials"
fi

# 2. Install dependencies
echo "[INFO] Installing dependencies..."
npm install

# 3. Run the server
echo "[INFO] Starting Express server on http://localhost:3000"
npm start
