---
id: parse-hacker-news-stories
name: Parse Hacker News Stories
version: 1.0.0
description: Extracts the top 20 Hacker News story records from fetched HTML.
user_invocable: false
always: false
requires:
  bins: [bash, python3]
  env: [RUN_ID]
primary_env: RUN_ID
input_path: /tmp/fetch-hacker-news-front-page_${RUN_ID}.json
output_path: /tmp/parse-hacker-news-stories_${RUN_ID}.json
depends_on: [fetch-hacker-news-front-page]
---

## Purpose

Turn the fetched Hacker News front page HTML into structured story records.

## I/O Contract

- **Input:** `/tmp/fetch-hacker-news-front-page_${RUN_ID}.json`, with `html` and `fetched_at`.
- **Output:** `/tmp/parse-hacker-news-stories_${RUN_ID}.json`, with `fetched_at` and `stories` containing `id`, `title`, `url`, `points`, `author`, `comments`, and `age`.
- **DB Write:** none.

## Notes

The parser only keeps the first 20 front-page stories and normalizes relative Hacker News links to full URLs.
