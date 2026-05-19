# Step 4 of 5 — Triggers

## Active Triggers

### hourly-hacker-news-fetch — Runs the main workflow once per hour in UTC to fetch and persist top Hacker News stories.

| Field       | Value                              |
|-------------|------------------------------------|
| **Type**    | cron                     |
| **Status**  | enabled                   |
| **Channel** | dashboard |
| **Frequency**   | Once per hour                       |
| **Cron**        | `0 * * * *`                        |

---

### dashboard-run-now — Dashboard Run now triggers the same main workflow as the hourly schedule with the same payload and persists/upserts into the existing result_stories table only.

| Field       | Value                              |
|-------------|------------------------------------|
| **Type**    | manual dashboard control                     |
| **Status**  | documented                   |
| **Channel** | dashboard |
| **Frequency**   | On demand from dashboard                       |

**Sample User Queries This Trigger Handles:**

- "Run now"

---

### dashboard-stories-tab — Main Stories tab reads persisted result_stories from the agent server, sorts by points descending, and shows clickable title, author, points, comments, and relative posted time.

| Field       | Value                              |
|-------------|------------------------------------|
| **Type**    | dashboard                     |
| **Status**  | documented                   |
| **Channel** | dashboard |

---

### dashboard-history-tab — History tab reads past fetched stories from the same persisted result_stories data through the agent server; it does not add a new fetch-run table or search history.

| Field       | Value                              |
|-------------|------------------------------------|
| **Type**    | dashboard                     |
| **Status**  | documented                   |
| **Channel** | dashboard |

