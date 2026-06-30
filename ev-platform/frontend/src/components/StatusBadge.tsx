import clsx from "clsx";

const STYLES: Record<string, string> = {
  high: "bg-success/10 text-success",
  medium: "bg-warning/10 text-warning",
  low: "bg-danger/10 text-danger",
};

const LABELS: Record<string, string> = {
  high: "High utilization",
  medium: "Medium utilization",
  low: "Low utilization",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={clsx("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", STYLES[status] ?? "bg-muted/10 text-muted")}>
      {LABELS[status] ?? status}
    </span>
  );
}
