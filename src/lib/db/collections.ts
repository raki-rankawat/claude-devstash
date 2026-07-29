import { prisma } from "@/lib/prisma";
import type {
  CollectionItemType,
  CollectionStats,
  DashboardCollection,
  SidebarCollection,
  SidebarCollections,
} from "@/types/collection";

/** How many collection cards the dashboard grid shows. */
export const DASHBOARD_COLLECTION_LIMIT = 6;

/** How many non-favourite collections the sidebar's Recent group lists. */
export const SIDEBAR_RECENT_COLLECTION_LIMIT = 5;

/**
 * Most recently updated collections, with each one's item count and the item
 * types it holds already derived. The join rows are fetched alongside the
 * collections (one round trip, not one per card) and tallied in memory, which
 * is cheap at dashboard page sizes.
 */
export async function getRecentCollections(
  userId: string,
  limit: number = DASHBOARD_COLLECTION_LIMIT,
): Promise<DashboardCollection[]> {
  const collections = await prisma.collection.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: limit,
    select: {
      id: true,
      name: true,
      description: true,
      isFavorite: true,
      updatedAt: true,
      defaultType: { select: { name: true, icon: true } },
      items: {
        select: {
          item: { select: { itemType: { select: { name: true, icon: true } } } },
        },
      },
    },
  });

  return collections.map((collection) => {
    const used = rankTypesByUsage(collection.items.map((row) => row.item.itemType));

    // An empty collection has nothing to rank, so fall back to its default type.
    const types =
      used.length > 0 ? used : collection.defaultType ? [collection.defaultType] : [];

    return {
      id: collection.id,
      name: collection.name,
      description: collection.description,
      isFavorite: collection.isFavorite,
      itemCount: collection.items.length,
      accentTypeName: types[0]?.name ?? null,
      types,
      updatedAt: collection.updatedAt,
    };
  });
}

/** Collection counts for the dashboard stats row. */
export async function getCollectionStats(userId: string): Promise<CollectionStats> {
  const [total, favorites] = await Promise.all([
    prisma.collection.count({ where: { userId } }),
    prisma.collection.count({ where: { userId, isFavorite: true } }),
  ]);

  return { total, favorites };
}

/** What a sidebar row needs: its label, its size and its accent colour. */
const SIDEBAR_COLLECTION_SELECT = {
  id: true,
  name: true,
  defaultType: { select: { name: true, icon: true } },
  items: {
    select: {
      item: { select: { itemType: { select: { name: true, icon: true } } } },
    },
  },
} as const;

/** The raw shape `SIDEBAR_COLLECTION_SELECT` produces. */
interface SidebarCollectionRecord {
  id: string;
  name: string;
  defaultType: CollectionItemType | null;
  items: { item: { itemType: CollectionItemType } }[];
}

/**
 * The sidebar's collection groups: every favourite, then the most recently
 * updated collections that are not already listed above. Both groups issue
 * together, so the nav costs two round trips regardless of its length.
 */
export async function getSidebarCollections(
  userId: string,
  recentLimit: number = SIDEBAR_RECENT_COLLECTION_LIMIT,
): Promise<SidebarCollections> {
  const [favorites, recent] = await Promise.all([
    prisma.collection.findMany({
      where: { userId, isFavorite: true },
      orderBy: { updatedAt: "desc" },
      select: SIDEBAR_COLLECTION_SELECT,
    }),
    prisma.collection.findMany({
      where: { userId, isFavorite: false },
      orderBy: { updatedAt: "desc" },
      take: recentLimit,
      select: SIDEBAR_COLLECTION_SELECT,
    }),
  ]);

  return {
    favorites: favorites.map(toSidebarCollection),
    recent: recent.map(toSidebarCollection),
  };
}

/** Reduces a collection to its row data, resolving the accent type as the grid does. */
function toSidebarCollection(
  collection: SidebarCollectionRecord,
): SidebarCollection {
  const used = rankTypesByUsage(collection.items.map((row) => row.item.itemType));

  // An empty collection has nothing to rank, so fall back to its default type.
  const accent = used[0] ?? collection.defaultType;

  return {
    id: collection.id,
    name: collection.name,
    itemCount: collection.items.length,
    accentTypeName: accent?.name ?? null,
  };
}

/**
 * Collapses a per-item type list into distinct types ordered by how often they
 * occur, so the first entry is the most-used one. Ties break on name to keep
 * the card's icon row stable across renders.
 */
function rankTypesByUsage(itemTypes: CollectionItemType[]): CollectionItemType[] {
  const tally = new Map<string, { type: CollectionItemType; count: number }>();

  for (const type of itemTypes) {
    const entry = tally.get(type.name);
    if (entry) {
      entry.count += 1;
    } else {
      tally.set(type.name, { type, count: 1 });
    }
  }

  return [...tally.values()]
    .sort((a, b) => b.count - a.count || a.type.name.localeCompare(b.type.name))
    .map((entry) => entry.type);
}
