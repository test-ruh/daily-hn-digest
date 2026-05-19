#!/usr/bin/env bash
set -euo pipefail

INPUT_FILE="${INPUT_FILE:-/dev/stdin}"
OUTPUT_FILE="${OUTPUT_FILE:-/tmp/fetch-hacker-news-front-page_${RUN_ID}.json}"

python3 - "$INPUT_FILE" "$OUTPUT_FILE" <<'PY'
import json
import sys
from datetime import datetime, timezone
from urllib import error, request

input_file, output_file = sys.argv[1], sys.argv[2]
url = "https://news.ycombinator.com"
try:
    if input_file != "/dev/stdin":
        with open(input_file, "r", encoding="utf-8") as f:
            raw = f.read().strip()
            if raw:
                data = json.loads(raw)
                url = data.get("url", url)
    else:
        raw = sys.stdin.read().strip()
        if raw:
            data = json.loads(raw)
            url = data.get("url", url)
except FileNotFoundError:
    pass

req = request.Request(url, headers={"User-Agent": "OpenClaw Hacker News Daily Digest/1.0"})
try:
    with request.urlopen(req, timeout=30) as resp:
        status = resp.getcode()
        body = resp.read().decode("utf-8", errors="replace")
except error.HTTPError as exc:
    body = exc.read(500).decode("utf-8", errors="replace").replace("\n", " ")
    print(f"Hacker News returned HTTP {exc.code}. Short error body: {body[:500]}", file=sys.stderr)
    raise SystemExit(1)
except error.URLError as exc:
    print(f"Could not reach Hacker News: {exc.reason}", file=sys.stderr)
    raise SystemExit(1)

if status != 200:
    print(f"Hacker News returned HTTP {status}.", file=sys.stderr)
    raise SystemExit(1)

out = {
    "url": url,
    "status": status,
    "fetched_at": datetime.now(timezone.utc).isoformat(),
    "html": body,
}
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False)
PY
