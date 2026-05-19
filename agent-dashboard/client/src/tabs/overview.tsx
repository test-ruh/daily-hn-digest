import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Badge,
  Button,
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
import { ExternalLink, MessageSquare, Newspaper, Play, RefreshCw, TrendingUp, UserRound } from "lucide-react";

import { apiBaseUrl } from "@/lib/api";
import type { ResultStories } from "../../../server/schema";

type PersistedStoryRow = Pick<
  ResultStories,
  "id" | "title" | "url" | "points" | "author" | "comments" | "posted_at" | "run_id" | "computed_at"
>;

type RunNowResponse = {
  ok: boolean;
  runner?: string;
  fetchedAt: string;
  persisted: number;
  rows: PersistedStoryRow[];
};

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

const storiesEndpoint = endpoint("/api/stories");
const runNowEndpoint = endpoint("/api/stories/run-now");

async function fetchStories() {
  const response = await fetch(storiesEndpoint, {
    headers: { Accept: "application/json" },
    credentials: "same-origin"
  });

  if (!response.ok) {
    throw new Error(`Unable to load persisted Hacker News stories from ${storiesEndpoint}`);
  }

  const payload = (await response.json()) as { rows?: PersistedStoryRow[] };
  if (!Array.isArray(payload.rows)) {
    throw new Error(`The ${storiesEndpoint} response did not include a stories row set`);
  }

  return payload.rows;
}

async function runNow() {
  const response = await fetch(runNowEndpoint, {
    method: "POST",
    headers: { Accept: "application/json" },
    credentials: "same-origin"
  });

  const payload = (await response.json().catch(() => null)) as RunNowResponse | { error?: string } | null;
  if (!response.ok || !payload) {
    const message = payload && "error" in payload && payload.error ? payload.error : `Unable to run Hacker News refresh through ${runNowEndpoint}`;
    throw new Error(message);
  }

  if (!("rows" in payload) || !Array.isArray(payload.rows)) {
    throw new Error(`The ${runNowEndpoint} response did not include refreshed story rows`);
  }

  return payload;
}

export function OverviewTab() {
  const queryClient = useQueryClient();
  const { data, isFetching, isPending, isError, error } = useQuery({
    queryKey: ["hacker-news-stories", "points-desc"],
    queryFn: fetchStories,
    retry: 1
  });

  const runNowMutation = useMutation({
    mutationFn: runNow,
    onSuccess: (payload) => {
      queryClient.setQueryData(["hacker-news-stories", "points-desc"], payload.rows);
      void queryClient.invalidateQueries({ queryKey: ["hacker-news-stories", "history"] });
    }
  });

  const stories = [...(data ?? [])].sort((a, b) => b.points - a.points);
  const topStory = stories[0];
  const hasStories = stories.length > 0;
  const runNowError = runNowMutation.error instanceof Error ? runNowMutation.error.message : null;
  const runNowSuccess = runNowMutation.data
    ? `Run now saved ${runNowMutation.data.persisted} Hacker News ${runNowMutation.data.persisted === 1 ? "story" : "stories"} ${relativeTime(runNowMutation.data.fetchedAt)}.`
    : null;
  const statusMessage = runNowMutation.isPending
    ? "Run now is triggering the same Hacker News workflow used by the hourly schedule."
    : runNowMutation.isError && runNowError
      ? runNowError
      : runNowSuccess ??
        (isPending
          ? `Loading persisted stories from ${storiesEndpoint}…`
          : isError
            ? error instanceof Error
              ? error.message
              : `Unable to load persisted Hacker News stories from ${storiesEndpoint}`
            : hasStories
              ? `Showing ${stories.length} persisted ${stories.length === 1 ? "story" : "stories"} from ${storiesEndpoint}.`
              : `No persisted stories returned by ${storiesEndpoint} yet. Use Run now or wait for the hourly Hacker News fetch workflow to write result_stories rows.`);

  return (
    <section aria-label="Hacker News stories" className="flex flex-col gap-4 p-6">
      <Card size="sm">
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Newspaper size={18} /> Hacker News front-page stories
            </CardTitle>
            <p className="m-0 text-sm text-muted-foreground">
              Persisted hourly and on-demand workflow results from the agent database, ranked by current points.
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 md:items-end">
            <Button
              type="button"
              size="sm"
              onClick={() => runNowMutation.mutate()}
              disabled={runNowMutation.isPending}
              className="gap-2"
            >
              {runNowMutation.isPending ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
              {runNowMutation.isPending ? "Running" : "Run now"}
            </Button>
            <div className="flex flex-wrap gap-2 md:justify-end">
              <Badge variant="secondary" className="gap-1">
                <TrendingUp size={14} /> {stories.length} stories
              </Badge>
              {topStory ? <Badge variant="outline">Top score: {topStory.points.toLocaleString()}</Badge> : null}
              {isFetching ? <Badge variant="outline">Refreshing</Badge> : null}
              {runNowMutation.isSuccess ? <Badge variant="outline">Run saved</Badge> : null}
              {(isError || runNowMutation.isError) ? <Badge variant="destructive">Needs attention</Badge> : null}
            </div>
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {hasStories ? (
                  stories.map((story) => (
                    <TableRow key={story.id}>
                      <TableCell className="max-w-[34rem]">
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
                      <TableCell className="text-right font-mono tabular-nums">
                        {story.points.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums">
                        <span className="inline-flex items-center justify-end gap-1.5">
                          <MessageSquare size={14} className="text-muted-foreground" /> {story.comments.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {relativeTime(story.posted_at)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                      {runNowMutation.isPending
                        ? "Run now is in progress; refreshed persisted rows will appear here when the save completes."
                        : isPending
                          ? "Waiting for /api/stories to return persisted Hacker News rows."
                          : isError
                            ? "The stories API request failed; check that the dashboard server is running and has access to result_stories."
                            : "No stories are persisted yet. Use Run now or wait for the next hourly fetch to populate result_stories."}
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

export default OverviewTab;
