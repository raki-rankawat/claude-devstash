import Link from "next/link";
import { Folder, Pin, Star } from "lucide-react";

import {
  ITEM_TYPE_BORDER_COLOR,
  ITEM_TYPE_ICONS,
  ITEM_TYPE_SOFT_BG,
  ITEM_TYPE_TEXT_COLOR,
} from "@/lib/item-type-icons";
import { cn } from "@/lib/utils";
import type { DashboardItem } from "@/types/item";

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/** A compact item row used by the Pinned and Recent Items lists. */
export function ItemRow({ item }: { item: DashboardItem }) {
  const Icon = ITEM_TYPE_ICONS[item.type.icon] ?? Folder;
  const accent = ITEM_TYPE_BORDER_COLOR[item.type.name];
  const iconBg = ITEM_TYPE_SOFT_BG[item.type.name];
  const iconColor = ITEM_TYPE_TEXT_COLOR[item.type.name];

  return (
    <Link
      href={`/items/${item.id}`}
      className={cn(
        "group flex items-start gap-4 rounded-xl border border-l-[3px] bg-card p-4 transition-colors hover:bg-muted/40",
        accent,
      )}
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg",
          iconBg,
        )}
      >
        <Icon className={cn("size-4", iconColor)} />
      </span>

      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-medium">{item.title}</h3>
          {item.isPinned && (
            <Pin className="size-3.5 shrink-0 text-muted-foreground" />
          )}
          {item.isFavorite && (
            <Star className="size-3.5 shrink-0 fill-amber-400 text-amber-400" />
          )}
          <span className="ml-auto shrink-0 text-xs text-muted-foreground">
            {formatDate(item.updatedAt)}
          </span>
        </div>

        {item.description && (
          <p className="line-clamp-1 text-sm text-muted-foreground">
            {item.description}
          </p>
        )}

        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
