# Step 5 of 5 — Access

## User Access

### Authorized Teams

| Team               | Access Level | Members (approx) |
|--------------------|-------------|-------------------|
| Agent owner | Admin | Workspace owner and approved maintainers |
| Dashboard viewers | Read and Run now | Users granted access to the agent dashboard |

### Restricted From

| Team / Role          | Reason                          |
|----------------------|---------------------------------|
| External messaging channels | The approved scope is dashboard only; no outbound notifications are allowed. |
| Story summarization or recommendation systems | The approved scope stores metadata only and does not generate summaries or recommendations. |

## HiTL Approvers

| Skill                | Action                         | Approver             | Fallback Approver    |
|----------------------|--------------------------------|----------------------|----------------------|
| upsert-result-stories | Database schema, table, or write-mode changes | Agent owner | Pause deployment until the owner approves the persistence change. |
| fetch-hacker-news-front-page | Changing the source URL or fetch scope | Agent owner | Keep the approved Hacker News front-page URL only. |
| read-result-stories | Changing dashboard reads away from persisted result_stories | Agent owner | Keep both dashboard tabs server-backed from result_stories. |

## Model Configuration

| Field                | Value                          |
|----------------------|--------------------------------|
| **Primary Model**    | gpt-4.1-mini   |
| **Fallback Model**   | gpt-4.1  |

## Token Budget

| Field                  | Value                  |
|------------------------|------------------------|
| **Monthly Budget**     | 100000 tokens |
| **Alert Threshold**    | 80000 tokens |
| **Auto-Pause on Limit**| No |

## Security & Permissions

| Permission                         | Allowed    |
|------------------------------------|------------|
| Read https://news.ycombinator.com front page | ✅ |
| Run main workflow from hourly cron and dashboard Run now | ✅ |
| Write result_stories through scripts/data_writer.py | ✅ |
| Read result_stories for server-backed Stories and History dashboard tabs | ✅ |
| Use dashboard stub data | ❌ |
| Send email, Slack, or other notifications | ❌ |
| Scrape pages beyond the Hacker News front page | ❌ |
| Add a new fetch-run table or search history | ❌ |
| Store fields outside id, title, url, points, comments, posted_at, run_id, computed_at | ❌ |
