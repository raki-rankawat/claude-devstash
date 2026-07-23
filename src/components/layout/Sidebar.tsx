import { Layers } from "lucide-react";

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground md:flex">
      <div className="flex h-16 shrink-0 items-center gap-2.5 px-4">
        <span className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <Layers className="size-4" />
        </span>
        <span className="text-lg font-semibold">DevStash</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2">
        <h2 className="text-sm font-medium text-muted-foreground">Sidebar</h2>
      </div>
    </aside>
  );
}
