import { ReactNode } from "react";
import clsx from "clsx";

export function Card({
  children,
  className,
  noPadding = false,
}: {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}) {
  return (
    <div
      className={clsx(
        "bg-card dark:bg-card-dark rounded-xl2 shadow-soft dark:shadow-soft-dark border border-border/60 dark:border-border-dark/60",
        !noPadding && "p-6",
        className
      )}
    >
      {children}
    </div>
  );
}
