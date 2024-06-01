#!/bin/bash
set -e
source /workspace/env-defaults

run_backend() {
    cd /workspace
    echo "Running backend"
    exec poetry run uvicorn backend.main:app --host 0.0.0.0 --port 8000
}

run_frontend() {
    cd /workspace/src/frontend
    pnpm build
    echo "Running frontend"
    pm2 start pnpm -- start
}

run_searxng() {
    echo "Running searxng"
    cd /workspace/searxng
    export SEARXNG_SETTINGS_PATH="/workspace/searxng/settings.yml"
    python3 searx/webapp.py
}

run_searxng &
run_frontend &
run_backend
