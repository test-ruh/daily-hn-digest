// server/schema.ts — AUTO-GENERATED from .openclaw/result-schema.yml.
// Do not edit by hand. Re-run scaffold_agent_dashboard to regenerate.
//
// One TypeScript type per result_* table the agent declares + a ResultTables
// index. Platform-injected columns (created_at, updated_at, run_id, org_id,
// agent_id) are appended after agent-declared columns.

/** Stores current Hacker News front-page story metadata collected by the hourly fetch workflow. */
export type ResultStories = {
  /** Hacker News story identifier. */
  id: string;
  /** Story title. */
  title: string;
  /** Story URL used by the dashboard title link. */
  url: string;
  /** Current story points at fetch time. */
  points: number;
  /** Hacker News username that posted the story. */
  author: string;
  /** Current comment count at fetch time. */
  comments: number;
  /** Derived posted datetime from story age at fetch time when needed. */
  posted_at: string;
  /** Platform run identifier added by the OpenClaw data writer for auditability. */
  run_id: string | null;
  /** Timestamp added by the OpenClaw data writer when the row was computed. */
  computed_at: string | null;
  /** ISO timestamp (platform-managed). */
  created_at: string;
  /** ISO timestamp (platform-managed). */
  updated_at: string | null;
  /** Org id (platform-managed). */
  org_id: string | null;
  /** Agent id (platform-managed). */
  agent_id: string | null;
};

export type ResultTables = {
  result_stories: ResultStories;
};
