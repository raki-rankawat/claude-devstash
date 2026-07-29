import { getSidebarCollections } from "@/lib/db/collections";
import { getItemTypeCounts } from "@/lib/db/items";
import { getCurrentUserId } from "@/lib/db/user";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { SidebarProvider } from "@/components/layout/sidebar-provider";

// The sidebar renders per-user database state, so nothing under this layout can
// be prerendered at build time.
export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userId = await getCurrentUserId();

  const [itemTypes, collections] = await Promise.all([
    getItemTypeCounts(userId),
    userId ? getSidebarCollections(userId) : { favorites: [], recent: [] },
  ]);

  return (
    <SidebarProvider>
      <div className="flex h-svh overflow-hidden">
        <Sidebar itemTypes={itemTypes} collections={collections} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="flex-1 overflow-y-auto px-4 py-8 md:px-8">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
