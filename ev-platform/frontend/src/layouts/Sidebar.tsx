import { NavLink } from "react-router-dom";
import { LayoutGrid, Zap, MapPin, BarChart3, Lightbulb, Upload } from "lucide-react";
import clsx from "clsx";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutGrid, end: true },
  { to: "/stations", label: "Station Analytics", icon: Zap },
  { to: "/map", label: "Map", icon: MapPin },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/insights", label: "Insights", icon: Lightbulb },
  { to: "/upload", label: "Upload Data", icon: Upload },
];



export function EVLogo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id="evlogo-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3DA2FF" />
          <stop offset="100%" stopColor="#0066E0" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#evlogo-grad)" />
      <path d="M35 14L20 35H29.5L26 50L44 28H33.5L35 14Z" fill="white" />
    </svg>
  );
}
export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border/60 bg-card px-4 py-6 dark:border-border-dark/60 dark:bg-card-dark md:flex">
      <div className="mb-8 flex items-center gap-2.5 px-2">
        <EVLogo size={24} />
        <div>
          <p className="text-sm font-bold leading-tight text-ink dark:text-ink-dark">EV Intelligence</p>
          <p className="text-xs leading-tight text-muted dark:text-muted-dark">Charging Platform</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-white shadow-soft"
                  : "text-muted hover:bg-bg dark:text-muted-dark dark:hover:bg-white/5"
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav> 
    </aside>
  );
}
