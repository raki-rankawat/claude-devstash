"use client";

import * as React from "react";

import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarContextValue {
  /** True when the viewport is below the mobile breakpoint. */
  isMobile: boolean;
  /** Desktop: whether the in-flow sidebar is expanded. */
  open: boolean;
  /** Mobile: whether the off-canvas drawer is open. */
  openMobile: boolean;
  /** Toggles the relevant state for the current viewport. */
  toggle: () => void;
  setOpenMobile: (value: boolean) => void;
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(true);
  const [openMobile, setOpenMobile] = React.useState(false);

  const toggle = React.useCallback(() => {
    if (isMobile) {
      setOpenMobile((value) => !value);
    } else {
      setOpen((value) => !value);
    }
  }, [isMobile]);

  const value = React.useMemo<SidebarContextValue>(
    () => ({ isMobile, open, openMobile, toggle, setOpenMobile }),
    [isMobile, open, openMobile, toggle],
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}
