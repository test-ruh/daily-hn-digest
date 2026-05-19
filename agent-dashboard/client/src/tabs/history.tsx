import { useQuery } from "@tanstack/react-query";
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@ruh-ai/ruh-design-system";
import { ExternalLink, History, MessageSquare, UserRound } from "lucide-react";

import { apiBaseUrl } from "@/lib/api";
import type { ResultStories } from "../../../server/schema";

type PersistedStoryRow = Pick<
  ResultStories,
  "id" | "title" | "url" | "points" | "author" | "comments" | "posted_at" | "run_id" | "computed_at"
>;

function relativeTime(value: string | null | undefined) {
  if (!value) return "time unknown";
  const posted = new Date(value).getTime();
  if (Number.isNaN(posted)) return "time unknown";

  const diffMs = Date.now() - posted;
  const absMs = Math.max(0, diffMs);
  const minutes = Math.floor(absMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function endpoint(path: string) {
  return `${apiBaseUrl.replace(/\/$/, "")}${path}`;
}

const historyEndpoint = endpoint("/api/stories/history");

async function fetchStoryHistory() {
  const response = await fetch(historyEndpoint, {
    headers: { Accept: "application/json" },
    credentials: "same-origin"
  });

  if (!response.ok) {
    throw new Error(`Unable to load persisted Hacker News story history from ${historyEndpoint}`);
  }

  const payload = (await response.json()) as { rows?: PersistedStoryRow[] };
  if (!Array.isArray(payload.rows)) {
    throw new Error(`The ${historyEndpoint} response did not include a stories row set`);
  }

  return payload.rows;
}

export function HistoryTab() {
  const { data, isFetching, isPending, isError, error } = useQuery({
    queryKey: ["hacker-news-stories", "history"],
    queryFn: fetchStoryHistory,
    retry: 1
  });

  const stories = data ?? [];
  const hasStories = stories.length > 0;
  const latestFetch = stories.find((story) => story.computed_at);
  const statusMessage = isPending
    ? `Loading persisted story history from ${historyEndpoint}…`
    : isError
      ? error instanceof Error
        ? error.message
        : `Unable to load persisted Hacker News story history from ${historyEndpoint}`
      : hasStories
        ? `Showing ${stories.length} persisted ${stories.length === 1 ? "story" : "stories"} from ${historyEndpoint}.`
        : `No persisted story history returned by ${historyEndpoint} yet. This view fills from result_stories after hourly fetches have saved rows.`;

  return (
    <section aria-label="Hacker News story history" className="flex flex-col gap-4 p-6">
      <Card size="sm">
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <History size={18} /> Story history
            </CardTitle>
            <p className="m-0 text-sm text-muted-foreground">
              Persisted Hacker News records from the existing result_stories table, ordered by most recent saved activity.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{stories.length} records</Badge>
            {latestFetch ? (
              <Badge variant="outline">
                Latest saved {relativeTime(latestFetch.computed_at)}
              </Badge>
            ) : null}
            {isFetching ? <Badge variant="outline">Refreshing</Badge> : null}
            {isError ? <Badge variant="destructive">History load failed</Badge> : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div role="status" className="rounded-lg border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
            {statusMessage}
          </div>
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Story</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead className="text-right">Points</TableHead>
                  <TableHead className="text-right">Comments</TableHead>
                  <TableHead className="text-right">Posted</TableHead>
                  <TableHead className="text-right">Saved</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hasStories ? (
                  stories.map((story) => (
                    <TableRow key={`${story.id}-${story.computed_at ?? story.run_id ?? story.posted_at}`}>
                      <TableCell className="max-w-[30rem]">
                        <a
                          href={story.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 font-medium text-foreground underline-offset-4 hover:underline"
                        >
                          <span className="truncate">{story.title}</span>
                          <ExternalLink size={14} className="shrink-0 text-muted-foreground" />
                        </a>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 text-sm">
                          <UserRound size={14} className="text-muted-foreground" /> {story.author}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums">{story.points.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono tabular-nums">
                        <span className="inline-flex items-center justify-end gap-1.5">
                          <MessageSquare size={14} className="text-muted-foreground" /> {story.comments.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">{relativeTime(story.posted_at)}</TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {relativeTime(story.computed_at)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                      {isPending
                        ? "Waiting for /api/stories/history to return persisted Hacker News rows."
                        : isError
                          ? "The history API request failed; check that the dashboard server can read result_stories."
                          : "No persisted story records are available yet. The history view will populate from result_stories after the next hourly fetch."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

export default HistoryTab;
