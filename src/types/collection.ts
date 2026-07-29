/** An item type as rendered on a collection card. */
export interface CollectionItemType {
  /** ItemType.name, e.g. "snippet" — drives the colour tokens. */
  name: string;
  /** ItemType.icon, a lucide-react icon name, e.g. "Code". */
  icon: string;
}

/** A collection shaped for the dashboard grid. */
export interface DashboardCollection {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  itemCount: number;
  /** Name of the most-used item type, drives the card accent. */
  accentTypeName: string | null;
  /** Distinct item types held by the collection, most-used first. */
  types: CollectionItemType[];
  updatedAt: Date;
}

/** Headline collection counts for the dashboard stats row. */
export interface CollectionStats {
  total: number;
  favorites: number;
}
