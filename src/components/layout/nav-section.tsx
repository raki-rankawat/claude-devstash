"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

interface NavSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

/** A collapsible sidebar group with a chevron toggle header. */
export function NavSection({
  title,
  defaultOpen = true,
  children,
}: NavSectionProps) {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <div className="py-1">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex items-center gap-1 rounded-md px-2 py-1.5 text-[0.8rem] font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <span>{title}</span>
        <ChevronDown
          className={cn(
            "size-3.5 transition-transform duration-200",
            !open && "-rotate-90",
          )}
        />
      </button>

      {open && <div className="mt-0.5 space-y-0.5">{children}</div>}
    </div>
  );
}
