import { Hono } from "hono";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { basename, join, resolve } from "node:path";

import { sql } from "../db";
import type { ResultStories } from "../schema";

type PersistedStoryRow = Pick<
  ResultStories,
  "id" | "title" | "url" | "points" | "author" | "comments" | "posted_at" | "run_id" | "computed_at"
>;

const execFileAsync = promisify(execFile);

function agentSchemaName() {
  return (process.env.AGENT_ID ?? "hacker-news-daily-digest").replace(/[-.]/g, "_");
}

function resultStoriesTable() {
  return sql`${sql(agentSchemaName())}.${sql("result_stories")}`;
}

const storyColumns = sql`
  id,
  title,
  url,
  points,
  author,
  comments,
  posted_at,
  run_id,
  computed_at
`;

function openclawRuntimeRoot() {
  const cwd = process.cwd();
  if (basename(cwd) === "agent-dashboard" && basename(resolve(cwd, "..")) === ".openclaw") {
    return resolve(cwd, "..");
  }
  return join(cwd, ".openclaw");
}

async function runSharedHourlyWorkflow() {
  const runtimeRoot = openclawRuntimeRoot();
  const baseEnv = {
    ...process.env,
    AGENT_ID: process.env.AGENT_ID ?? "hacker-news-daily-digest"
  };
  const attempts = [
    {
      command: "openclaw",
      args: ["cron", "run", "--name", "hourly-hacker-news-fetch"],
      label: "openclaw cron run --name hourly-hacker-news-fetch"
    },
    {
      command: "lobster",
      args: ["run", "workflows/main.yaml"],
      label: "lobster run workflows/main.yaml"
    }
  ];
  const failures: string[] = [];

  for (const attempt of attempts) {
    try {
      const result = await execFileAsync(attempt.command, attempt.args, {
        cwd: runtimeRoot,
        env: baseEnv,
        timeout: 600_000,
        maxBuffer: 1024 * 1024
      });
      return {
        runner: attempt.label,
        stdout: result.stdout,
        stderr: result.stderr
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      failures.push(`${attempt.label}: ${message}`);
    }
  }

  throw new Error(`Unable to trigger the shared hourly Hacker News workflow. ${failures.join(" | ")}`);
}

export const route = new Hono();

route.get("/stories", async (c) => {
  const rows = await sql<PersistedStoryRow[]>`
    SELECT ${storyColumns}
    FROM ${resultStoriesTable()}
    ORDER BY points DESC, comments DESC, posted_at DESC
    LIMIT 20
  `;

  return c.json({ rows });
});

route.get("/stories/history", async (c) => {
  const rows = await sql<PersistedStoryRow[]>`
    SELECT ${storyColumns}
    FROM ${resultStoriesTable()}
    ORDER BY computed_at DESC NULLS LAST, posted_at DESC, points DESC
    LIMIT 100
  `;

  return c.json({ rows });
});

route.post("/stories/run-now", async (c) => {
  try {
    const workflow = await runSharedHourlyWorkflow();
    const completedAt = new Date().toISOString();
    const rows = await sql<PersistedStoryRow[]>`
      SELECT ${storyColumns}
      FROM ${resultStoriesTable()}
      ORDER BY points DESC, comments DESC, posted_at DESC
      LIMIT 20
    `;

    return c.json({
      ok: true,
      runner: workflow.runner,
      fetchedAt: completedAt,
      persisted: rows.length,
      rows
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to trigger the shared hourly Hacker News workflow";
    return c.json({ ok: false, error: message }, 500);
  }
});
