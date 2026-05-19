---
id: derive-story-posted-at
name: Derive Story Posted At
version: 1.0.0
description: Converts Hacker News age text into posted_at timestamps.
user_invocable: false
always: false
requires:
  bins: [bash, python3]
  env: [RUN_ID]
primary_env: RUN_ID
input_path: /tmp/parse-hacker-news-stories_${RUN_ID}.json
output_path: /tmp/derive-story-posted-at_${RUN_ID}.json
depends_on: [parse-hacker-news-stories]
---

## Purpose

Compute each story's `posted_at` value from the parsed Hacker News age and the fetch time.

## I/O Contract

- **Input:** `/tmp/parse-hacker-news-stories_${RUN_ID}.json`, with `fetched_at` and `stories` containing age text.
- **Output:** `/tmp/derive-story-posted-at_${RUN_ID}.json`, with `stories` containing `id`, `title`, `url`, `points`, `author`, `comments`, and `posted_at`.
- **DB Write:** none.

## Notes

Supported age units are minutes, hours, days, months, and years. Unknown age text falls back to the fetch time.
