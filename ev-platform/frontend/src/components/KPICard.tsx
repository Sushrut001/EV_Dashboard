import { ReactNode } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card } from "./Card";
import clsx from "clsx";

export function KPICard({
  label,
  value,
  icon,
  trend,
  suffix,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  trend?: number;
  suffix?: string;
}) {
  const isPositive = (trend ?? 0) >= 0;
  return (
    <Card className="animate-slide-up">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
        {trend !== undefined && (
          <div
            className={clsx(
              "flex items-center gap-0.5 rounded-full px-2 py-1 text-xs font-semibold",
              isPositive ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
            )}
          >
            {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-muted dark:text-muted-dark">{label}</p>
        <p className="mt-1 text-2xl font-bold tracking-tight text-ink dark:text-ink-dark">
          {value}
          {suffix && <span className="ml-1 text-base font-medium text-muted dark:text-muted-dark">{suffix}</span>}
        </p>
      </div>
    </Card>
  );
}
