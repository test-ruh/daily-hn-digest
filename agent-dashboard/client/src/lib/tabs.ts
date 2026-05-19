import { defaultRouteId, routes } from "@/routes.config";

/**
 * Tab routing helpers for the dashboard.
 *
 * In the frame model, the dashboard's tabs are NOT a fixed list — the
 * agent declares them in `routes.config.ts`. These helpers just bridge
 * the registry to `location.hash` so the URL reflects the active tab
 * and a deep-link / refresh restores it.
 *
 * The platform tester enforces a single convention: a route with
 * `id: "overview"` must exist. Other tab ids are agent-chosen kebab-case
 * strings.
 */

export type TabId = string;

const knownIds = (): ReadonlyArray<string> => routes.map((r) => r.id);

const defaultId = (): string => {
  const ids = knownIds();
  if (ids.includes(defaultRouteId)) return defaultRouteId;
  return ids[0] ?? "overview";
};

export const isKnownTabId = (value: string): boolean => knownIds().includes(value);

/** Read the active tab from `location.hash`, falling back to the default route. */
export const readActiveTab = (): TabId => {
  const raw = (globalThis.location?.hash || "").replace(/^#\/?/, "");
  return raw && isKnownTabId(raw) ? raw : defaultId();
};

/** Write the active tab to `location.hash`. */
export const writeActiveTab = (id: TabId): void => {
  if (globalThis.location) {
    globalThis.location.hash = `#${id}`;
  }
};
