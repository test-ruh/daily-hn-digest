---
id: fetch-hacker-news-front-page
name: Fetch Hacker News Front Page
version: 1.0.0
description: Fetches the Hacker News front page HTML for the hourly digest.
user_invocable: false
always: false
requires:
  bins: [bash, python3]
  env: [RUN_ID]
primary_env: RUN_ID
input_path: /dev/stdin
output_path: /tmp/fetch-hacker-news-front-page_${RUN_ID}.json
depends_on: []
---

## Purpose

Fetch the current Hacker News front page from `https://news.ycombinator.com` once for this run.

## I/O Contract

- **Input:** `/dev/stdin` or `INPUT_FILE`, optional JSON with `url`; defaults to `https://news.ycombinator.com`.
- **Output:** `/tmp/fetch-hacker-news-front-page_${RUN_ID}.json`, with `url`, `status`, `fetched_at`, and `html`.
- **DB Write:** none.

## Notes

This skill fails the run if Hacker News does not return HTTP 200. Error body text is shortened before logging.
