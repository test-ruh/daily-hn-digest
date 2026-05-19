import { Layers } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { identityCard } from "@/identity-card-data";
import Header from "@/layout/header";
import RightRail from "@/layout/right-rail";
import Sidebar from "@/layout/sidebar";
import TopTabs from "@/layout/top-tabs";
import type { SidebarItem } from "@/lib/sidebar";
import { readActiveTab, writeActiveTab, type TabId } from "@/lib/tabs";
import { routes } from "@/routes.config";

/**
 * Root App for the agent-dashboard skeleton.
 *
 * Frame layout (platform-managed):
 *   - Left sidebar (80px): one icon per route declared in `routes.config.ts`,
 *     plus optional agent-declared additions. Pre-AB-404 the sidebar shipped
 *     a fixed eight-item platform navigation; that's been removed because
 *     none of it was per-agent operator content.
 *   - Center column: identity-card header + top-tabs (only when >1 route)
 *     + active tab body.
 *   - Right rail (80px): 4 standard operator tools (Rebuild / Terminal
 *     / Browser / Function), disabled in skeleton-only mode.
 *
 * Custom content (agent-owned):
 *   - `routes.config.ts` declares the tabs the operator needs
 *   - Each `tabs/<id>.tsx` is React code the agent-dashboard-builder
 *     writes for the agent's domain
 *   - `identity-card-data.ts` carries the agent's static identity meta
 *
 * The skeleton intentionally does NOT impose widget palettes or layout
 * patterns inside tabs — agents compose whatever UI the operator needs
 * for their specific automation.
 */
export function App() {
  const [activeTab, setActiveTab] = useState<TabId>(readActiveTab);

  useEffect(() => {
    const onHashChange = (): void => setActiveTab(readActiveTab());
    globalThis.addEventListener("hashchange", onHashChange);
    return () => globalThis.removeEventListener("hashchange", onHashChange);
  }, []);

  const onSelectTab = (id: TabId): void => {
    writeActiveTab(id);
    setActiveTab(id);
  };

  // Sidebar items derive from the agent's routes (one icon per tab). The
  // agent-dashboard-builder may extend this list via additions but the
  // skeleton ships with the tab-derived items as the canonical baseline.
  const sidebarItems = useMemo<SidebarItem[]>(
    () =>
      routes.map((route) => ({
        id: route.id,
        label: route.label,
        icon: route.icon ?? Layers,
        hint: route.hint ?? route.label
      })),
    []
  );

  const ActiveTabComponent = useMemo(() => {
    const route = routes.find((r) => r.id === activeTab) ?? routes[0];
    return route?.Component ?? null;
  }, [activeTab]);

  // Top tabs render only when the agent declared more than one route —
  // single-tab dashboards skip the redundant tab bar, sidebar still shows
  // the one icon.
  const showTopTabs = routes.length > 1;

  return (
    <>
      <Sidebar active={activeTab} items={sidebarItems} onSelect={onSelectTab} />
      <div style={{ display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <Header identity={identityCard} />
        {showTopTabs && <TopTabs active={activeTab} onSelect={onSelectTab} />}
        <main style={{ flex: 1, overflow: "auto" }}>
          {ActiveTabComponent ? <ActiveTabComponent /> : null}
        </main>
      </div>
      <RightRail
        disabledTools={["rebuild", "terminal", "browser", "function"]}
        onSelect={(tool) => console.info(`[agent-dashboard] right-rail tool clicked: ${tool}`)}
      />
    </>
  );
}

export default App;
