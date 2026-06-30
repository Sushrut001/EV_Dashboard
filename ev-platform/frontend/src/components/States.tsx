import { Loader2, Inbox, AlertTriangle } from "lucide-react";

export function LoadingState({ label = "Loading data" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted dark:text-muted-dark">
      <Loader2 className="animate-spin text-primary" size={28} />
      <p className="text-sm font-medium">{label}…</p>
    </div>
  );
}

export function EmptyState({
  title = "No data yet",
  description = "Upload a dataset to see results here.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/10 text-muted dark:text-muted-dark">
        <Inbox size={22} />
      </div>
      <p className="font-semibold text-ink dark:text-ink-dark">{title}</p>
      <p className="max-w-sm text-sm text-muted dark:text-muted-dark">{description}</p>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger">
        <AlertTriangle size={22} />
      </div>
      <p className="font-semibold text-ink dark:text-ink-dark">Couldn't load data</p>
      <p className="max-w-sm text-sm text-muted dark:text-muted-dark">{message}</p>
    </div>
  );
}
