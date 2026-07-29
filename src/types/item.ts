/** The item's type, reduced to what a row needs to pick its icon and colour. */
export interface DashboardItemType {
  /** ItemType.name, e.g. "snippet" — drives the colour tokens. */
  name: string;
  /** ItemType.icon, a lucide-react icon name, e.g. "Code". */
  icon: string;
}

/** An item shaped for the dashboard's pinned and recent lists. */
export interface DashboardItem {
  id: string;
  title: string;
  description: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  type: DashboardItemType;
  tags: string[];
  updatedAt: Date;
}

/** Headline item counts for the dashboard stats row. */
export interface ItemStats {
  total: number;
  favorites: number;
}

/** A system item type as listed in the sidebar's Types nav. */
export interface SidebarItemType {
  /** ItemType.name, e.g. "snippet" — drives the label, route and colour. */
  name: string;
  /** ItemType.icon, a lucide-react icon name, e.g. "Code". */
  icon: string;
  /** How many of the user's items use this type. */
  itemCount: number;
}
