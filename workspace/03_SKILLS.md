# Step 3 of 5 — Skills

## Added Skills

| #    | Skill ID                  | Skill Name               | Mode   | Risk Level | Description                |
|------|---------------------------|--------------------------|--------|------------|----------------------------|
| S1   | `data-writer` | Data Writer | Auto | Low | Provision, write, and query the agent database schema via scripts/data_writer.py. Use for all PostgreSQL operations and any result-table persistence. |
| S2   | `result-query` | Result Query | Auto | Low | Read stored records from the agent result tables for inspection and follow-up questions. |
| S3   | `github-action` | GitHub Action | Auto | Low | Git branch + PR workflow for syncing agent changes to GitHub. Creates feature branches, commits changes, and opens pull requests against main. NEVER pushes to main directly. MANDATORY for every agent. |
| S4   | `fetch-hacker-news-front-page` | Fetch Hacker News Front Page | Auto | Low | Fetches the Hacker News front page HTML for scheduled and dashboard Run now refreshes. |
| S5   | `parse-hacker-news-stories` | Parse Hacker News Stories | Auto | Low | Extracts the top 20 Hacker News story records from fetched HTML. |
| S6   | `derive-story-posted-at` | Derive Story Posted At | Auto | Low | Converts Hacker News age text into posted_at timestamps. |
| S7   | `upsert-result-stories` | Upsert Result Stories | Auto | Low | Saves normalized Hacker News stories into the existing result_stories table for hourly and Run now refreshes. |
| S8   | `read-result-stories` | Read Result Stories | Auto | Low | Reads persisted Hacker News stories from result_stories for the server-backed Stories and History dashboard tabs. |

## Skill Dependencies (Execution Order)

```
data-writer
result-query
github-action
fetch-hacker-news-front-page
parse-hacker-news-stories ← depends on fetch-hacker-news-front-page
derive-story-posted-at ← depends on parse-hacker-news-stories
upsert-result-stories ← depends on derive-story-posted-at
read-result-stories ← depends on upsert-result-stories
```

## Execution Mode Summary

| Mode  | Count          |
|-------|----------------|
| HiTL  | 0              |
| Auto  | 8 |
