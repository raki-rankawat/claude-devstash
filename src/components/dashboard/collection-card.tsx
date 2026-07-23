import Link from "next/link";
import { Folder, MoreHorizontal, Star } from "lucide-react";

import { itemTypes, type Collection } from "@/lib/mock-data";
import {
  ITEM_TYPE_BORDER_COLOR,
  ITEM_TYPE_ICONS,
  ITEM_TYPE_TEXT_COLOR,
} from "@/lib/item-type-icons";
import { cn } from "@/lib/utils";

const typeById = new Map(itemTypes.map((type) => [type.id, type]));

/** A collection tile with a type-coloured accent, item count and content icons. */
export function CollectionCard({ collection }: { collection: Collection }) {
  const defaultType = typeById.get(collection.defaultTypeId);
  const accent = defaultType ? ITEM_TYPE_BORDER_COLOR[defaultType.name] : "";

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
          <p className="text-xs text-muted-foreground">{collection.itemCount} items</p>
        </div>
        <MoreHorizontal className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </div>

      <p className="line-clamp-2 text-sm text-muted-foreground">
        {collection.description}
      </p>

      <div className="mt-auto flex items-center gap-2 pt-1">
        {collection.typeIds.map((typeId) => {
          const type = typeById.get(typeId);
          if (!type) return null;
          const Icon = ITEM_TYPE_ICONS[type.icon] ?? Folder;
          return (
            <Icon
              key={typeId}
              className={cn("size-4", ITEM_TYPE_TEXT_COLOR[type.name])}
            />
          );
        })}
      </div>
    </Link>
  );
}
