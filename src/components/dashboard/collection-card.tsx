import Link from "next/link";
import { Folder, MoreHorizontal, Star } from "lucide-react";

import {
  ITEM_TYPE_BORDER_COLOR,
  ITEM_TYPE_ICONS,
  ITEM_TYPE_TEXT_COLOR,
} from "@/lib/item-type-icons";
import { cn } from "@/lib/utils";
import type { DashboardCollection } from "@/types/collection";

/** A collection tile with a type-coloured accent, item count and content icons. */
export function CollectionCard({ collection }: { collection: DashboardCollection }) {
  const accent = collection.accentTypeName
    ? ITEM_TYPE_BORDER_COLOR[collection.accentTypeName]
    : undefined;

  return (
    <Link
      href={`/collections/${collection.id}`}
      className={cn(
        "group flex min-h-44 flex-col gap-3 rounded-xl border border-l-[3px] bg-card p-5 transition-colors hover:bg-muted/40",
        accent,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate font-medium">{collection.name}</h3>
            {collection.isFavorite && (
              <Star className="size-3.5 shrink-0 fill-amber-400 text-amber-400" />
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {collection.itemCount} {collection.itemCount === 1 ? "item" : "items"}
          </p>
        </div>
        <MoreHorizontal className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </div>

      <p className="line-clamp-2 text-sm text-muted-foreground">
        {collection.description}
      </p>

      <div className="mt-auto flex items-center gap-2 pt-1">
        {collection.types.map((type) => {
          const Icon = ITEM_TYPE_ICONS[type.icon] ?? Folder;
          return (
            <Icon
              key={type.name}
              className={cn("size-4", ITEM_TYPE_TEXT_COLOR[type.name])}
            />
          );
        })}
      </div>
    </Link>
  );
}
