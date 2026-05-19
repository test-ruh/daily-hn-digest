---
id: read-result-stories
name: Read Result Stories
version: 1.0.0
description: Reads persisted Hacker News stories sorted by points for the dashboard.
user_invocable: false
always: false
requires:
  bins: [bash, python3]
  env: [PG_CONNECTION_STRING, RUN_ID]
primary_env: PG_CONNECTION_STRING
input_path: /dev/stdin
output_path: /tmp/read-result-stories_${RUN_ID}.json
depends_on: [upsert-result-stories]
---

## Purpose

Return saved Hacker News stories from `result_stories` so the dashboard uses persisted agent data.

## I/O Contract

- **Input:** dashboard request on `/dev/stdin` or `INPUT_FILE`; no fields are required.
- **Output:** `/tmp/read-result-stories_${RUN_ID}.json`, with persisted `records` sorted by `points` descending.
- **DB Write:** none.

## Notes

This skill reads through `${PROJECT_ROOT}/scripts/data_writer.py query` using `PG_CONNECTION_STRING`.
