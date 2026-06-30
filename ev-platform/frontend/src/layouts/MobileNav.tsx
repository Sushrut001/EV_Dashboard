import { NavLink } from "react-router-dom";
import { LayoutGrid, Zap, MapPin, BarChart3, Lightbulb, Upload, X } from "lucide-react";
import clsx from "clsx";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutGrid, end: true },
  { to: "/stations", label: "Station Analytics", icon: Zap },
  { to: "/map", label: "Map", icon: MapPin },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/insights", label: "Insights", icon: Lightbulb },
  { to: "/upload", label: "Upload Data", icon: Upload },
];

export function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute left-0 top-0 h-full w-72 animate-slide-up bg-card p-5 dark:bg-card-dark">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
              <Zap size={18} fill="white" />
            </div>
            <p className="text-sm font-bold text-ink dark:text-ink-dark">EV Intelligence</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted hover:bg-bg dark:text-muted-dark dark:hover:bg-white/10">
            <X size={18} />
          </button>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
                  isActive ? "bg-primary text-white" : "text-muted dark:text-muted-dark"
                )
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
