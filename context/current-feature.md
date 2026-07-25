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
