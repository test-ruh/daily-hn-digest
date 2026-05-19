# Step 2 of 5 — Rules

## Custom Agent Rules

| #    | Rule                  | Category        |
|------|-----------------------|-----------------|
| same-flow-run-now   | Dashboard Run now must invoke the same main workflow as the hourly schedule and persist only to the existing result_stories table. | dashboard |
| no-summaries   | Do not summarize, rank by opinion, or editorialize story content. | content |
| dashboard-only   | Use the dashboard/server data path only; do not send email, Slack, or other notifications. | channel |
| freshness-honesty   | Do not claim the dashboard is freshly updated if the refresh failed; show or describe the most recently persisted stories instead. | reliability |
| front-page-only   | Fetch only the Hacker News front page and keep only the approved story metadata fields. | scope |
| server-backed-dashboard   | The Stories tab and History tab must fetch persisted result_stories through the agent's own server/database and must not use stub data. | dashboard |

## Rule Enforcement Summary

| Metric                  | Value                      |
|-------------------------|----------------------------|
| Total Custom Rules      | 6 |
| Total Inherited Rules   | 0 |
| **Total Active Rules**  | **6**               |
