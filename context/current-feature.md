# Current Feature

<!-- Feature Name -->

## Status

<!-- Not Started|In Progress|Completed -->

Completed

## Goals

<!-- Goals & requirements -->

## Notes

<!-- Any extra notes -->

## History

<!-- Keep this updated. Earliest to latest -->

- Project setup and boilerplate cleanup
- Dashboard UI Phase 1 — ShadCN init + components, `/dashboard` route, dashboard shell layout (sidebar/main placeholders), dark mode by default, top bar with display-only search and New Item button
- Dashboard UI Phase 2 — Sidebar built from mock data: collapsible/desktop + off-canvas mobile drawer with backdrop and toggle button, Types nav (linked to `/items/TYPE`, active highlight), Collections split into Favorites and Recent, and user avatar footer
- Dashboard UI Phase 3 — Main content area from mock data: 4 stats cards (items, collections, favorite items, favorite collections), Collections grid (recent, type-coloured accents + content icons), Pinned items list, and 10 most-recent items; new StatCard/CollectionCard/ItemRow components and `ITEM_TYPE_BORDER_COLOR`/`ITEM_TYPE_SOFT_BG` colour maps
- Database Layer — Prisma 7 + Neon PostgreSQL: schema for `User`/`Item`/`ItemType`/`Collection`/`ItemCollection`/`Tag` plus the NextAuth models, applied as the `init` migration; configured via `prisma.config.ts` and the `prisma-client` generator (v7 moves the datasource url out of the schema, requires an explicit generator `output`, and makes driver adapters mandatory); queries go through `@prisma/adapter-neon` over WebSockets on 443, which also works on networks that block 5432; client singleton at `src/lib/prisma.ts`, idempotent seed of the 7 system item types (explicit lookup rather than `upsert`, since Postgres treats the null `userId` as distinct), `scripts/test-db.ts` smoke check and `db:*` npm scripts
- Seed Data — Demo user `demo@devstash.io` (password `12345678`, bcryptjs at 12 rounds) with 5 collections and 18 items: React Patterns (3 TypeScript snippets), AI Workflows (3 prompts), DevOps (1 snippet, 1 command, 2 links), Terminal Commands (4 commands), Design Resources (4 links); links use real URLs, `defaultTypeId` set on the single-type collections, and pins/favourites/tags applied so the dashboard's stat cards and pinned list have data. Re-runnable — the seed drops the demo user first and lets the cascades clear their items and collections, then sweeps tags orphaned by the rebuild, since tags are global rather than user-owned. `scripts/test-db.ts` extended to fetch, validate and print the demo data (18 checks covering the password hash, item/collection counts, `contentType` correctness, https links and pinned/favourite coverage)
- Dashboard Collections — the collections grid and the two collection stat cards now read from Postgres instead of `src/lib/mock-data.ts`. New `src/lib/db/collections.ts`: `getRecentCollections` pulls the 6 most recently updated collections together with their join rows in a single round trip and tallies the item types in memory, so each card gets its item count, most-used type (drives the left border accent) and distinct type icons without a per-card query — icon ties break on type name so the row stays stable between renders; `getCollectionStats` returns the total and favourite counts. `src/lib/db/user.ts` resolves the seeded `demo@devstash.io` account and returns null when the seed has not run, so the page falls back to an empty state rather than throwing — this is the seam NextAuth replaces later. Shapes live in `src/types/collection.ts`, `CollectionCard` now takes a `DashboardCollection`, and the page became an async server component with `dynamic = "force-dynamic"` so per-user data is never prerendered at build time. The item stat cards and the sidebar collections stay on mock data until the items feature
- Dashboard Items — the pinned list, the recent items list and the two item stat cards now read from Postgres, so nothing in the dashboard's main area comes from `src/lib/mock-data.ts` any more. New `src/lib/db/items.ts`: `getPinnedItems` and `getRecentItems` (10 by default) share one `select` that joins the item type and tags, so a list costs a single round trip rather than a query per row; tags are ordered by name because an implicit many-to-many guarantees no ordering of its own and the chip row would otherwise shuffle between renders. `getItemStats` returns the total and favourite counts. Shapes live in `src/types/item.ts` (`DashboardItem`, `DashboardItemType`, `ItemStats`), and `ItemRow` now takes a `DashboardItem` and reads its icon, border accent and tint straight off `item.type` instead of looking the id up in the mock `itemTypes` array — `formatDate` takes a `Date` rather than an ISO string. All five dashboard queries issue together in the existing `Promise.all`. Recent Items gained the dashed empty state the collections grid already had, since an unseeded database otherwise rendered a bare heading; Pinned still hides entirely when nothing is pinned. Markup is otherwise untouched. The seed writes all 18 items in one pass so they share an `updatedAt` and the recent ordering within that tie is arbitrary until items are edited through the UI, and the rows link to `/items/[id]`, which does not exist yet. `src/lib/mock-data.ts` stays for the sidebar
