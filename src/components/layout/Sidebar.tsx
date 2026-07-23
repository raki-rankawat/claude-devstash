"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Folder, Layers, Settings, Star } from "lucide-react";

import {
  collections,
  currentUser,
  itemTypes,
  type User,
} from "@/lib/mock-data";
import { ITEM_TYPE_ICONS, ITEM_TYPE_TEXT_COLOR } from "@/lib/item-type-icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { NavSection } from "@/components/layout/nav-section";
import { useSidebar } from "@/components/layout/sidebar-provider";

const favoriteCollections = collections.filter((c) => c.isFavorite);

const recentCollections = collections
  .filter((c) => !c.isFavorite)
  .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));

export function Sidebar() {
  const { open, openMobile, setOpenMobile } = useSidebar();
  const pathname = usePathname();

  const closeMobile = () => setOpenMobile(false);

  return (
    <>
      {/* Mobile drawer backdrop */}
      <div
        aria-hidden
        onClick={closeMobile}
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 md:hidden",
          openMobile ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
          "transition-transform duration-200 ease-in-out",
          openMobile ? "translate-x-0" : "-translate-x-full",
          "md:static md:z-auto md:translate-x-0 md:overflow-hidden md:transition-[width] md:duration-200 md:ease-in-out",
          open ? "md:w-64" : "md:w-0 md:border-r-0",
        )}
      >
        <div className="flex h-full w-64 flex-col">
          {/* Brand */}
          <div className="flex h-16 shrink-0 items-center gap-2.5 px-4">
            <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
              <Layers className="size-4" />
            </span>
            <span className="text-lg font-semibold">DevStash</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 pb-4">
            <NavSection title="Types">
              {itemTypes.map((type) => {
                const Icon = ITEM_TYPE_ICONS[type.icon] ?? Folder;
                return (
                  <SidebarLink
                    key={type.id}
                    href={type.route}
                    active={pathname === type.route}
                    onNavigate={closeMobile}
                  >
                    <Icon
                      className={cn("size-4 shrink-0", ITEM_TYPE_TEXT_COLOR[type.name])}
                    />
                    <span className="flex-1 truncate">{type.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {type.itemCount}
                    </span>
                  </SidebarLink>
                );
              })}
            </NavSection>

            <div className="my-2 border-t border-sidebar-border" />

            <NavSection title="Collections">
              {favoriteCollections.length > 0 && (
                <>
                  <SubGroupLabel>Favorites</SubGroupLabel>
                  {favoriteCollections.map((collection) => (
                    <SidebarLink
                      key={collection.id}
                      href={`/collections/${collection.id}`}
                      active={pathname === `/collections/${collection.id}`}
                      onNavigate={closeMobile}
                    >
                      <Folder className="size-4 shrink-0 text-muted-foreground" />
                      <span className="flex-1 truncate">{collection.name}</span>
                      <Star className="size-3.5 shrink-0 fill-amber-400 text-amber-400" />
                    </SidebarLink>
                  ))}
                </>
              )}

              {recentCollections.length > 0 && (
                <>
                  <SubGroupLabel className="mt-3">Recent</SubGroupLabel>
                  {recentCollections.map((collection) => (
                    <SidebarLink
                      key={collection.id}
                      href={`/collections/${collection.id}`}
                      active={pathname === `/collections/${collection.id}`}
                      onNavigate={closeMobile}
                    >
                      <Folder className="size-4 shrink-0 text-muted-foreground" />
                      <span className="flex-1 truncate">{collection.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {collection.itemCount}
                      </span>
                    </SidebarLink>
                  ))}
                </>
              )}
            </NavSection>
          </nav>

          <UserFooter user={currentUser} />
        </div>
      </aside>
    </>
  );
}

function SidebarLink({
  href,
  active,
  onNavigate,
  children,
}: {
  href: string;
  active: boolean;
  onNavigate: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground/90 transition-colors",
        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        active && "bg-sidebar-accent font-medium text-sidebar-accent-foreground",
      )}
    >
      {children}
    </Link>
  );
}

function SubGroupLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "px-2 pt-1 pb-0.5 text-[0.7rem] font-medium tracking-wider text-muted-foreground/70 uppercase",
        className,
      )}
    >
      {children}
    </p>
  );
}

function UserFooter({ user }: { user: User }) {
  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="mt-auto flex shrink-0 items-center gap-3 border-t border-sidebar-border p-3">
      {user.image ? (
        <Image
          src={user.image}
          alt={user.name}
          width={36}
          height={36}
          className="size-9 shrink-0 rounded-full object-cover"
        />
      ) : (
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-xs font-medium text-sidebar-accent-foreground">
          {initials}
        </span>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{user.name}</p>
        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
      </div>

      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Settings"
        className="shrink-0"
      >
        <Settings />
      </Button>
    </div>
  );
}
