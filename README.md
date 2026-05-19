# 🧡 Hacker News Daily Digest

Fetches the top 20 Hacker News front-page stories hourly and on dashboard Run now requests, stores them, and shows server-backed Stories and History tabs.

## Quick Start

```bash
git clone git@github.com:${GITHUB_OWNER}/hacker-news-daily-digest.git
cd hacker-news-daily-digest

# 1. Configure
cp .env.example .env
# Edit .env with your credentials (see "Required Environment Variables" below)

# 2. One-shot setup: validates env, installs deps, provisions DB, registers cron
chmod +x setup.sh
./setup.sh
```

## Manual Setup (if you prefer step-by-step)

```bash
cp .env.example .env             # then edit it
set -a; source .env; set +a       # load vars into the current shell
bash check-environment.sh         # verify everything required is set
bash install-dependencies.sh      # pip install psycopg2-binary, pyyaml
python3 scripts/data_writer.py provision   # create tables in your schema
openclaw cron add --file cron/hourly-hacker-news-fetch.json
```

## Running

```bash
bash test-workflow.sh             # run every skill in order locally (smoke test)
openclaw cron run --name hourly-hacker-news-fetch    # trigger manually
openclaw cron list                # see registered jobs
openclaw cron runs                # see run history
```

## Required Environment Variables

| Variable | Description |
|----------|-------------|


## Skills

| Skill | Mode | Description |
|-------|------|-------------|
| `data-writer` | Auto | Provision, write, and query the agent database schema via scripts/data_writer.py. Use for all PostgreSQL operations and any result-table persistence. |
| `result-query` | User-invocable | Read stored records from the agent result tables for inspection and follow-up questions. |
| `github-action` | User-invocable | Git branch + PR workflow for syncing agent changes to GitHub. Creates feature branches, commits changes, and opens pull requests against main. NEVER pushes to main directly. MANDATORY for every agent. |
| `fetch-hacker-news-front-page` | Auto | Fetches the Hacker News front page HTML for scheduled and dashboard Run now refreshes. |
| `parse-hacker-news-stories` | Auto | Extracts the top 20 Hacker News story records from fetched HTML. |
| `derive-story-posted-at` | Auto | Converts Hacker News age text into posted_at timestamps. |
| `upsert-result-stories` | Auto | Saves normalized Hacker News stories into the existing result_stories table for hourly and Run now refreshes. |
| `read-result-stories` | Auto | Reads persisted Hacker News stories from result_stories for the server-backed Stories and History dashboard tabs. |

## Scheduled Jobs

| Job Name | Schedule | Notes |
|----------|----------|-------|
| `hourly-hacker-news-fetch` | `0 * * * *` | Timezone: UTC |


## Architecture

- **Runtime**: OpenClaw AI agent framework
- **Data Layer**: PostgreSQL via `scripts/data_writer.py`
- **Scheduling**: OpenClaw cron
- **Schema**: `org_{org_id}_a_hacker_news_daily_digest`

## Directory Structure

```
hacker-news-daily-digest/
├── README.md
├── openclaw.json
├── result-schema.yml
├── env-manifest.yml
├── .env.example
├── requirements.txt
├── .gitignore
├── check-environment.sh
├── install-dependencies.sh
├── test-workflow.sh
├── cron/
├── workflows/
├── scripts/
│   ├── data_writer.py
│   └── github_action.py
├── skills/
└── workspace/
    ├── SOUL.md
    ├── 01_IDENTITY.md
    ├── 02_RULES.md
    ├── 03_SKILLS.md
    ├── 04_TRIGGERS.md
    ├── 05_ACCESS.md
    ├── 06_WORKFLOW.md
    └── 07_REVIEW.md
```
