import { Moon, Sun, Menu } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";

const TITLES: Record<string, { title: string; subtitle: string }> = {
  "/": { title: "Dashboard", subtitle: "Network performance at a glance" },
  "/stations": { title: "Station Analytics", subtitle: "Performance breakdown by charging station" },
  "/map": { title: "Station Map", subtitle: "Explore your network geographically" },
  "/analytics": { title: "Analytics", subtitle: "Charging demand and usage patterns" },
  "/insights": { title: "Business Insights", subtitle: "Automated, data-driven observations" },
  "/upload": { title: "Upload Data", subtitle: "Bring in a new charging sessions dataset" },
};

export function TopBar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { isDark, toggle } = useTheme();
  const { pathname } = useLocation();
  const meta = TITLES[pathname] ?? { title: "EV Intelligence", subtitle: "" };

  return ( 
    <header className="sticky top-0 z-30 glass border-b border-border/60 px-4 py-4 dark:border-border-dark/60 sm:px-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="rounded-lg p-2 text-ink hover:bg-bg dark:text-ink-dark dark:hover:bg-white/10 md:hidden"
          >
            <Menu size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-ink dark:text-ink-dark sm:text-2xl">{meta.title}</h1>
            {meta.subtitle && <p className="text-sm text-muted dark:text-muted-dark">{meta.subtitle}</p>}
          </div>
        </div>

        <button
          onClick={toggle}
          aria-label="Toggle dark mode"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-card text-ink transition-colors hover:bg-bg dark:border-border-dark/60 dark:bg-card-dark dark:text-ink-dark dark:hover:bg-white/10"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
