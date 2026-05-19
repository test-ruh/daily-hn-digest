import { History, Newspaper, type LucideIcon } from "lucide-react";
import type { ComponentType } from "react";

import HistoryTab from "@/tabs/history";
import OverviewTab from "@/tabs/overview";

export type DashboardRoute = {
  id: string;
  label: string;
  icon?: LucideIcon;
  Component: ComponentType;
  hint?: string;
};

export const routes: DashboardRoute[] = [
  {
    id: "overview",
    label: "Main Stories",
    icon: Newspaper,
    Component: OverviewTab,
    hint: "Persisted Hacker News stories ranked by points"
  },
  {
    id: "history",
    label: "History",
    icon: History,
    Component: HistoryTab,
    hint: "Past saved Hacker News story records"
  }
];

export const defaultRouteId = "overview";
