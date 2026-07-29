import {
  Code,
  File,
  Image,
  Link,
  type LucideIcon,
  Sparkles,
  StickyNote,
  Terminal,
} from "lucide-react";

/** Resolves an ItemType.icon name to its lucide component. */
export const ITEM_TYPE_ICONS: Record<string, LucideIcon> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link,
};

/**
 * Maps an ItemType.name to a Tailwind text-colour utility. Backed by the
 * `--color-<type>` theme tokens declared in globals.css. Full class names are
 * listed literally so Tailwind keeps them during purge.
 */
export const ITEM_TYPE_TEXT_COLOR: Record<string, string> = {
  snippet: "text-snippet",
  prompt: "text-prompt",
  command: "text-command",
  note: "text-note",
  file: "text-file",
  image: "text-image",
  link: "text-link",
};

/** Left-border accent utility per ItemType.name (drives card accents). */
export const ITEM_TYPE_BORDER_COLOR: Record<string, string> = {
  snippet: "border-l-snippet",
  prompt: "border-l-prompt",
  command: "border-l-command",
  note: "border-l-note",
  file: "border-l-file",
  image: "border-l-image",
  link: "border-l-link",
};

/** Soft (10% alpha) background utility per ItemType.name, for tinted icon chips. */
export const ITEM_TYPE_SOFT_BG: Record<string, string> = {
  snippet: "bg-snippet/10",
  prompt: "bg-prompt/10",
  command: "bg-command/10",
  note: "bg-note/10",
  file: "bg-file/10",
  image: "bg-image/10",
  link: "bg-link/10",
};

/** Solid background utility per ItemType.name, for the sidebar's colour dots. */
export const ITEM_TYPE_DOT_BG: Record<string, string> = {
  snippet: "bg-snippet",
  prompt: "bg-prompt",
  command: "bg-command",
  note: "bg-note",
  file: "bg-file",
  image: "bg-image",
  link: "bg-link",
};

/**
 * Nav label for an ItemType.name, e.g. "snippet" → "Snippets". The table stores
 * the singular name only, so the plural shown in the UI is derived.
 */
export function itemTypeLabel(name: string): string {
  return `${name.charAt(0).toUpperCase()}${name.slice(1)}s`;
}

/** Route listing every item of a type, e.g. "snippet" → "/items/snippets". */
export function itemTypeRoute(name: string): string {
  return `/items/${name}s`;
}
