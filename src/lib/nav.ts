export interface NavItem {
  href: "/" | "/analytics" | "/calendar" | "/achievements";
  label: string;
  short: string;
  icon: string;
  description: string;
}

export const NAV_ITEMS: readonly NavItem[] = [
  {
    href: "/",
    label: "Dashboard",
    short: "Today",
    icon: "LayoutDashboard",
    description: "Today's tasks, score and momentum",
  },
  {
    href: "/analytics",
    label: "Analytics",
    short: "Stats",
    icon: "ChartSpline",
    description: "Weekly and monthly performance",
  },
  {
    href: "/calendar",
    label: "Calendar",
    short: "History",
    icon: "CalendarDays",
    description: "Your full consistency record",
  },
  {
    href: "/achievements",
    label: "Achievements",
    short: "Badges",
    icon: "Medal",
    description: "Levels, XP and badges",
  },
] as const;
