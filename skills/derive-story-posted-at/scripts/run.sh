#!/usr/bin/env bash
set -euo pipefail

INPUT_FILE="${INPUT_FILE:-/tmp/parse-hacker-news-stories_${RUN_ID}.json}"
OUTPUT_FILE="${OUTPUT_FILE:-/tmp/derive-story-posted-at_${RUN_ID}.json}"

python3 - "$INPUT_FILE" "$OUTPUT_FILE" <<'PY'
import json
import re
import sys
from datetime import datetime, timedelta, timezone

input_file, output_file = sys.argv[1], sys.argv[2]

def parse_dt(value):
    if value:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    return datetime.now(timezone.utc)

def posted_at(age, fetched_at):
    text = (age or "").strip().lower()
    m = re.search(r"(\d+)\s+(minute|minutes|hour|hours|day|days|month|months|year|years)", text)
    if not m:
        return fetched_at
    n = int(m.group(1))
    unit = m.group(2)
    if unit.startswith("minute"):
        delta = timedelta(minutes=n)
    elif unit.startswith("hour"):
        delta = timedelta(hours=n)
    elif unit.startswith("day"):
        delta = timedelta(days=n)
    elif unit.startswith("month"):
        delta = timedelta(days=30 * n)
    else:
        delta = timedelta(days=365 * n)
    return fetched_at - delta

with open(input_file, "r", encoding="utf-8") as f:
    payload = json.load(f)
fetched_at = parse_dt(payload.get("fetched_at"))
out_stories = []
for story in payload.get("stories", [])[:20]:
    out_stories.append({
        "id": str(story.get("id", "")),
        "title": story.get("title", ""),
        "url": story.get("url", ""),
        "points": int(story.get("points") or 0),
        "author": story.get("author") or "unknown",
        "comments": int(story.get("comments") or 0),
        "posted_at": posted_at(story.get("age"), fetched_at).isoformat(),
    })
if not out_stories:
    print("No stories were available for posted time calculation.", file=sys.stderr)
    raise SystemExit(1)
with open(output_file, "w", encoding="utf-8") as f:
    json.dump({"fetched_at": fetched_at.isoformat(), "stories": out_stories}, f, ensure_ascii=False)
PY
