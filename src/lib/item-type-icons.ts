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

/** Resolves an ItemType.icon name (from mock data) to its lucide component. */
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
