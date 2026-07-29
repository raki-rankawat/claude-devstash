import { prisma } from "@/lib/prisma";
import type { DashboardItem, ItemStats, SidebarItemType } from "@/types/item";

/** How many rows the dashboard's Recent Items list shows. */
export const DASHBOARD_RECENT_ITEM_LIMIT = 10;

/**
 * Order the system types appear in the sidebar. `item_types` has no ordering
 * column, and alphabetical would scatter the text types among the file ones.
 */
const SYSTEM_TYPE_ORDER = [
  "snippet",
  "prompt",
  "command",
  "note",
  "file",
  "image",
  "link",
];

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

/**
 * The system item types with the user's item count for each, in display order.
 * Takes a nullable id so the Types nav still renders (all zeroes) before a user
 * is resolved — the nav is navigation, not user data.
 */
export async function getItemTypeCounts(
  userId: string | null,
): Promise<SidebarItemType[]> {
  const [types, countByTypeId] = await Promise.all([
    prisma.itemType.findMany({
      where: { isSystem: true },
      select: { id: true, name: true, icon: true },
    }),
    countItemsByType(userId),
  ]);

  return types
    .map((type) => ({
      name: type.name,
      icon: type.icon,
      itemCount: countByTypeId.get(type.id) ?? 0,
    }))
    .sort(bySystemTypeOrder);
}

/**
 * Tallies the user's items per type in one grouped query rather than a count
 * per type. Types with no items are absent from the result, so callers default
 * to zero.
 */
async function countItemsByType(
  userId: string | null,
): Promise<Map<string, number>> {
  if (!userId) return new Map();

  const rows = await prisma.item.groupBy({
    by: ["itemTypeId"],
    where: { userId },
    _count: { _all: true },
  });

  return new Map(rows.map((row) => [row.itemTypeId, row._count._all]));
}

/** Sorts into `SYSTEM_TYPE_ORDER`, with anything unlisted trailing by name. */
function bySystemTypeOrder(a: SidebarItemType, b: SidebarItemType): number {
  const aIndex = SYSTEM_TYPE_ORDER.indexOf(a.name);
  const bIndex = SYSTEM_TYPE_ORDER.indexOf(b.name);

  if (aIndex === -1 || bIndex === -1) {
    if (aIndex === bIndex) return a.name.localeCompare(b.name);
    return aIndex === -1 ? 1 : -1;
  }

  return aIndex - bIndex;
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
