# Hacker News Daily Digest Dashboard

Hacker News Daily Digest 🧡 gives the operator a database-backed view of the hourly and on-demand Hacker News front-page fetch. The dashboard intentionally avoids fake story data: both tabs call the agent server with same-origin `/api/...` paths by default, and show loading, empty, running, success, or error states until persisted `result_stories` rows exist.

## Tabs

- **Main Stories** — the landing tab lists persisted `result_stories` records sorted by `points` descending. Each row links the title to `url` and shows author, points, comments, and a relative age derived from `posted_at`, matching the operator's primary review workflow for the latest saved front-page snapshot. This tab includes the approved **Run now** control, which calls the dashboard server to trigger the same hourly Hacker News workflow path (`workflows/main.yaml`) used by the schedule, then reloads the persisted rows.
- **History** — a second navigation tab reads the same existing `result_stories` table through the dashboard API and orders records by the most recent saved activity. It gives the operator a past-record view without introducing a separate run-history table, a search-history feature, or static preview rows.

## Triggers

- **Hourly Hacker News fetch** — cron trigger `0 * * * *` in UTC. It fetches the current top 20 stories from `https://news.ycombinator.com`, parses story metadata, derives `posted_at`, and upserts rows into `result_stories`.
- **Dashboard Run now** — manual dashboard control on the Main Stories tab. It posts to the agent's own server, which invokes the shared runtime workflow used by cron (`fetch-hacker-news-front-page` → `parse-hacker-news-stories` → `derive-story-posted-at` → `upsert-result-stories` via `scripts/data_writer.py`) and refreshes the visible story data when the workflow completes.

## Sidebar additions

- None. The approved change requires dashboard tabs and an in-tab Run now control only; no non-dashboard sidebar surface is needed.

## Server endpoints

- `GET /api/stories` — returns up to 20 persisted rows from the agent-owned schema-qualified `result_stories` table, selecting only `id`, `title`, `url`, `points`, `author`, `comments`, `posted_at`, `run_id`, and `computed_at`, ordered by points descending for the Main Stories table.
- `GET /api/stories/history` — returns up to 100 persisted rows from the same agent-owned schema-qualified `result_stories` table, selecting only provisioned story/runtime columns and ordering by `computed_at`, `posted_at`, then points for the History table.
- `POST /api/stories/run-now` — invokes the shared hourly Hacker News runtime workflow (`openclaw cron run --name hourly-hacker-news-fetch`, with `lobster run workflows/main.yaml` as a workflow-runner fallback) instead of reimplementing fetch/parse/upsert inside the dashboard server, then returns the refreshed persisted rows for the Main Stories tab.

## v2 Deferrals

- None.
