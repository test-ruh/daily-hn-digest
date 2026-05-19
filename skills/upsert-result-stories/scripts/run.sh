#!/usr/bin/env bash
set -euo pipefail

INPUT_FILE="${INPUT_FILE:-/tmp/derive-story-posted-at_${RUN_ID}.json}"
OUTPUT_FILE="${OUTPUT_FILE:-/tmp/upsert-result-stories_${RUN_ID}.json}"
PROJECT_ROOT="${PROJECT_ROOT:-$(pwd)}"
WRITER="${PROJECT_ROOT}/scripts/data_writer.py"

if [[ -z "${PG_CONNECTION_STRING:-}" ]]; then
  echo "PG_CONNECTION_STRING is required to save stories." >&2
  exit 1
fi
if [[ ! -x "$WRITER" && ! -f "$WRITER" ]]; then
  echo "Could not find scripts/data_writer.py under PROJECT_ROOT." >&2
  exit 1
fi

RECORDS_FILE="$(mktemp)"
trap 'rm -f "$RECORDS_FILE"' EXIT
python3 - "$INPUT_FILE" "$RECORDS_FILE" <<'PY'
import json
import sys
input_file, records_file = sys.argv[1], sys.argv[2]
with open(input_file, "r", encoding="utf-8") as f:
    payload = json.load(f)
records = []
for story in payload.get("stories", [])[:20]:
    records.append({
        "id": str(story["id"]),
        "title": story["title"],
        "url": story["url"],
        "points": int(story["points"]),
        "author": story["author"],
        "comments": int(story["comments"]),
        "posted_at": story["posted_at"],
    })
if not records:
    print("No stories were available to save.", file=sys.stderr)
    raise SystemExit(1)
with open(records_file, "w", encoding="utf-8") as f:
    json.dump(records, f, ensure_ascii=False)
PY

WRITER_OUTPUT="$(python3 "$WRITER" write --table result_stories --records "$(cat "$RECORDS_FILE")" --conflict id --run-id "${RUN_ID}")"
printf '%s\n' "$WRITER_OUTPUT" > "$OUTPUT_FILE"
