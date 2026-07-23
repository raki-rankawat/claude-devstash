import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  /** Tailwind bg + text utilities for the icon chip, e.g. "bg-snippet/10 text-snippet". */
  iconClassName?: string;
}

/** A single headline metric shown in the dashboard stats row. */
export function StatCard({ label, value, icon: Icon, iconClassName }: StatCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border bg-card p-4">
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-lg",
          iconClassName,
        )}
      >
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
        <p className="mt-0.5 truncate text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
