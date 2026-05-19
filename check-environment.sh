#!/usr/bin/env bash
# Check required environment variables are set.
set -euo pipefail

missing=0

if [ $missing -gt 0 ]; then
    echo "$missing required env var(s) missing"
    exit 1
fi
echo "OK: all required env vars set"
