import type { Metadata } from "next";
import Link from "next/link";
import { Clock, FileStack, FolderHeart, Library, Pin, Star } from "lucide-react";

import { getCollectionStats, getRecentCollections } from "@/lib/db/collections";
import { getItemStats, getPinnedItems, getRecentItems } from "@/lib/db/items";
import { getCurrentUserId } from "@/lib/db/user";
import { CollectionCard } from "@/components/dashboard/collection-card";
import { ItemRow } from "@/components/dashboard/item-row";
import { StatCard } from "@/components/dashboard/stat-card";

export const metadata: Metadata = {
  title: "Dashboard | DevStash",
};

// The dashboard renders per-user database state, so it must not be prerendered
// at build time.
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const userId = await getCurrentUserId();

  const [recentCollections, collectionStats, pinnedItems, recentItems, itemStats] =
    await Promise.all([
      userId ? getRecentCollections(userId) : [],
      userId ? getCollectionStats(userId) : { total: 0, favorites: 0 },
      userId ? getPinnedItems(userId) : [],
      userId ? getRecentItems(userId) : [],
      userId ? getItemStats(userId) : { total: 0, favorites: 0 },
    ]);

  const stats = [
    {
      label: "Items",
      value: itemStats.total,
      icon: FileStack,
      iconClassName: "bg-snippet/10 text-snippet",
    },
    {
      label: "Collections",
      value: collectionStats.total,
      icon: Library,
      iconClassName: "bg-prompt/10 text-prompt",
    },
    {
      label: "Favorite Items",
      value: itemStats.favorites,
      icon: Star,
      iconClassName: "bg-note/10 text-note",
    },
    {
      label: "Favorite Collections",
      value: collectionStats.favorites,
      icon: FolderHeart,
      iconClassName: "bg-link/10 text-link",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-10">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Your developer knowledge hub</p>
      </div>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      {/* Collections */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Collections</h2>
          <Link
            href="/collections"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            View all
          </Link>
        </div>
        {recentCollections.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentCollections.map((collection) => (
              <CollectionCard key={collection.id} collection={collection} />
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            No collections yet.
          </p>
        )}
      </section>

      {/* Pinned */}
      {pinnedItems.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Pin className="size-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold tracking-tight">Pinned</h2>
          </div>
          <div className="space-y-3">
            {pinnedItems.map((item) => (
              <ItemRow key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* Recent items */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="size-4 text-muted-foreground" />
          <h2 className="text-lg font-semibold tracking-tight">Recent Items</h2>
        </div>
        {recentItems.length > 0 ? (
          <div className="space-y-3">
            {recentItems.map((item) => (
              <ItemRow key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            No items yet.
          </p>
        )}
      </section>
    </div>
  );
}
