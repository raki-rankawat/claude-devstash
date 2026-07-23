"use client";

import { PanelLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/layout/sidebar-provider";

export function SidebarToggle() {
  const { toggle } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label="Toggle sidebar"
      className="shrink-0"
    >
      <PanelLeft />
    </Button>
  );
}
