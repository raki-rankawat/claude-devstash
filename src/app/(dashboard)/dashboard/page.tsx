import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | DevStash",
};

export default function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Your developer knowledge hub</p>
      </div>

      <h2 className="text-sm font-medium text-muted-foreground">Main</h2>
    </div>
  );
}
