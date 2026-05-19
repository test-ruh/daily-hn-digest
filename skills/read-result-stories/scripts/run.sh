#!/usr/bin/env bash
set -euo pipefail

INPUT_FILE="${INPUT_FILE:-/dev/stdin}"
OUTPUT_FILE="${OUTPUT_FILE:-/tmp/read-result-stories_${RUN_ID}.json}"
PROJECT_ROOT="${PROJECT_ROOT:-$(pwd)}"
WRITER="${PROJECT_ROOT}/scripts/data_writer.py"

if [[ -z "${PG_CONNECTION_STRING:-}" ]]; then
  echo "PG_CONNECTION_STRING is required to read saved stories." >&2
  exit 1
fi
if [[ ! -x "$WRITER" && ! -f "$WRITER" ]]; then
  echo "Could not find scripts/data_writer.py under PROJECT_ROOT." >&2
  exit 1
fi

# Preserve caller-provided input path even though this read endpoint has no required input.
if [[ "$INPUT_FILE" != "/dev/stdin" && -f "$INPUT_FILE" ]]; then
  :
fi

python3 "$WRITER" query --table result_stories --limit 100 --order-by "points DESC" > "$OUTPUT_FILE"
