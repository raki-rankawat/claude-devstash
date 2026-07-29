import { prisma } from "@/lib/prisma";
import type { DashboardItem, ItemStats } from "@/types/item";

/** How many rows the dashboard's Recent Items list shows. */
export const DASHBOARD_RECENT_ITEM_LIMIT = 10;

/**
 * Everything an item row renders. The type and tags are joined in rather than
 * fetched per row, so a list costs one round trip.
 */
const DASHBOARD_ITEM_SELECT = {
  id: true,
  title: true,
  description: true,
  isFavorite: true,
  isPinned: true,
  updatedAt: true,
  itemType: { select: { name: true, icon: true } },
  // Tags are ordered so the chip row stays stable between renders — an
  // implicit many-to-many gives no ordering guarantee of its own.
  tags: { select: { name: true }, orderBy: { name: "asc" } },
} as const;

/** The raw shape `DASHBOARD_ITEM_SELECT` produces. */
interface ItemRecord {
  id: string;
  title: string;
  description: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  updatedAt: Date;
  itemType: { name: string; icon: string };
  tags: { name: string }[];
}

/** Pinned items, newest first. Empty when the user has pinned nothing. */
export async function getPinnedItems(userId: string): Promise<DashboardItem[]> {
  const items = await prisma.item.findMany({
    where: { userId, isPinned: true },
    orderBy: { updatedAt: "desc" },
    select: DASHBOARD_ITEM_SELECT,
  });

  return items.map(toDashboardItem);
}

/** Most recently updated items, pinned ones included. */
export async function getRecentItems(
  userId: string,
  limit: number = DASHBOARD_RECENT_ITEM_LIMIT,
): Promise<DashboardItem[]> {
  const items = await prisma.item.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: limit,
    select: DASHBOARD_ITEM_SELECT,
  });

  return items.map(toDashboardItem);
}

/** Item counts for the dashboard stats row. */
export async function getItemStats(userId: string): Promise<ItemStats> {
  const [total, favorites] = await Promise.all([
    prisma.item.count({ where: { userId } }),
    prisma.item.count({ where: { userId, isFavorite: true } }),
  ]);

  return { total, favorites };
}

/** Flattens the joined type and tag rows into the shape `ItemRow` consumes. */
function toDashboardItem(item: ItemRecord): DashboardItem {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    type: item.itemType,
    tags: item.tags.map((tag) => tag.name),
    updatedAt: item.updatedAt,
  };
}
