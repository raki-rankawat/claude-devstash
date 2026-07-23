import { Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Topbar() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b px-4 md:px-6">
      <div className="relative w-full max-w-md">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search items..."
          aria-label="Search items"
          className="h-10 rounded-xl pr-16 pl-9"
        />
        <kbd className="pointer-events-none absolute top-1/2 right-3 hidden -translate-y-1/2 items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[0.7rem] text-muted-foreground sm:inline-flex">
          ⌘ K
        </kbd>
      </div>

      <Button size="lg" className="ml-auto rounded-xl">
        <Plus />
        New Item
      </Button>
    </header>
  );
}
