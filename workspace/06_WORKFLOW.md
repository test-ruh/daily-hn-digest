# Workflow — End-to-End Process Flow

Executed by the [Lobster runtime](https://github.com/openclaw/lobster) via `lobster run workflows/main.yaml`.
Steps run **sequentially** in the order shown below.

## Workflow Steps

1. **provision-schema** → `run: python3 scripts/data_writer.py provision` (timeout_ms=30000)
2. **fetch-hacker-news-front-page** → skill `fetch-hacker-news-front-page` (stdin={"url":"https://news.ycombinator.com"}, timeout_ms=120000, retry=2)
3. **parse-hacker-news-stories** → skill `parse-hacker-news-stories` (stdin={{steps.fetch-hacker-news-front-page.output}}, timeout_ms=120000, retry=1)
4. **derive-story-posted-at** → skill `derive-story-posted-at` (stdin={{steps.parse-hacker-news-stories.output}}, timeout_ms=120000, retry=1)
5. **upsert-result-stories** → skill `upsert-result-stories` (stdin={{steps.derive-story-posted-at.output}}, timeout_ms=120000, retry=1)

## Diagram

```
provision-schema → fetch-hacker-news-front-page → parse-hacker-news-stories → derive-story-posted-at → upsert-result-stories
```
