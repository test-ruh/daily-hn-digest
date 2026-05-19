---
id: upsert-result-stories
name: Upsert Result Stories
version: 1.0.0
description: Saves normalized Hacker News stories into result_stories.
user_invocable: false
always: false
requires:
  bins: [bash, python3]
  env: [PG_CONNECTION_STRING, RUN_ID]
primary_env: PG_CONNECTION_STRING
input_path: /tmp/derive-story-posted-at_${RUN_ID}.json
output_path: /tmp/upsert-result-stories_${RUN_ID}.json
depends_on: [derive-story-posted-at]
---

## Purpose

Persist the current top Hacker News stories so the dashboard can read saved data from the agent server.

## I/O Contract

- **Input:** `/tmp/derive-story-posted-at_${RUN_ID}.json`, with `stories` containing `id`, `title`, `url`, `points`, `author`, `comments`, and `posted_at`.
- **Output:** `/tmp/upsert-result-stories_${RUN_ID}.json`, with writer status and `records_affected`.
- **DB Write:** `result_stories` via `data_writer.py` upsert on columns `id`.

## Notes

All database writes go through `${PROJECT_ROOT}/scripts/data_writer.py` and use `PG_CONNECTION_STRING`.
