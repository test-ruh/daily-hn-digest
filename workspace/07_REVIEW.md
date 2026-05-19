# Review — Final Summary Before Save

## Agent Card

| Field              | Value                          |
|--------------------|--------------------------------|
| **Name**           | 🧡 Hacker News Daily Digest |
| **ID**             | `hacker-news-daily-digest`           |
| **Version**        | 1.0.0 |
| **Scope**          | Fetches the top 20 Hacker News front-page stories hourly and on dashboard Run now requests, stores them, and shows server-backed Stories and History tabs.      |
| **Tone**           | personal, concise, utility-focused, and reliable             |
| **Model**          | gpt-4.1-mini (primary), gpt-4.1 (fallback) |
| **Token Budget**   | 100000 tokens/month |

## Skills Summary

| Skill                     | Mode         |
|---------------------------|--------------|
| Data Writer | 🟢 Auto |
| Result Query | 🟢 Auto |
| GitHub Action | 🟢 Auto |
| Fetch Hacker News Front Page | 🟢 Auto |
| Parse Hacker News Stories | 🟢 Auto |
| Derive Story Posted At | 🟢 Auto |
| Upsert Result Stories | 🟢 Auto |
| Read Result Stories | 🟢 Auto |

## Post-Save Checklist

- [ ] Confirm cron hourly-hacker-news-fetch is enabled with 0 * * * * UTC.
- [ ] Use the dashboard Run now button and verify it triggers the same main workflow as the hourly cron.
- [ ] Verify Run now upserts rows into the existing result_stories table and creates no new tables.
- [ ] Run the main workflow once and verify result_stories has up to 20 rows.
- [ ] Verify title, url, points, author, comments, and posted_at are populated for saved stories.
- [ ] Confirm Stage 7 dashboard has Stories and History tabs plus a Run now control.
- [ ] Confirm both dashboard tabs read persisted result_stories through the agent server and do not use stub data.
- [ ] Confirm Stories is sorted by points descending and both tabs link story titles to url.
