# Current Feature

<!-- Feature Name -->

Database Layer — Prisma 7 + Neon PostgreSQL

## Status

<!-- Not Started|In Progress|Completed -->

In Progress

## Goals

<!-- Goals & requirements -->

Set up Prisma ORM against a Neon serverless PostgreSQL database, with the initial schema for DevStash.

- **Neon PostgreSQL (serverless)** — development branch connection string in `DATABASE_URL`, separate production branch
- **Prisma 7** — read the [upgrade guide](https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7) and [Prisma Postgres quickstart](https://www.prisma.io/docs/getting-started/prisma-orm/quickstart/prisma-postgres) before writing config; v7 has breaking changes (generator output, client import path, driver adapters, config file)
- **Initial schema** from the data models in @context/project-overview.md — `User`, `Item`, `ItemType`, `Collection`, `ItemCollection`, `Tag`, and the `ContentType` enum. Treat it as a starting point; it will evolve
- **NextAuth models** — `Account`, `Session`, `VerificationToken`
- **Indexes and cascade deletes** — index `userId` / `itemTypeId` / `createdAt` on items, `userId` on collections; cascade user-owned records on user delete
- **Seed script** — upsert the 7 system item types (snippet, prompt, command, note, file, image, link)
- **Prisma client singleton** at `src/lib/prisma.ts` to avoid dev hot-reload connection leaks

## Notes

<!-- Any extra notes -->

- **Migrations only.** Never `prisma db push` or edit the database structure directly. Create migrations with `npx prisma migrate dev --name <name>` against the dev branch; production applies them with `npx prisma migrate deploy`.
- Run `npx prisma migrate status` before committing to confirm dev and the migration history are in sync.
- Full requirements: @context/features/database-spec.md

## History

<!-- Keep this updated. Earliest to latest -->

- Project setup and boilerplate cleanup
- Dashboard UI Phase 1 — ShadCN init + components, `/dashboard` route, dashboard shell layout (sidebar/main placeholders), dark mode by default, top bar with display-only search and New Item button
- Dashboard UI Phase 2 — Sidebar built from mock data: collapsible/desktop + off-canvas mobile drawer with backdrop and toggle button, Types nav (linked to `/items/TYPE`, active highlight), Collections split into Favorites and Recent, and user avatar footer
- Dashboard UI Phase 3 — Main content area from mock data: 4 stats cards (items, collections, favorite items, favorite collections), Collections grid (recent, type-coloured accents + content icons), Pinned items list, and 10 most-recent items; new StatCard/CollectionCard/ItemRow components and `ITEM_TYPE_BORDER_COLOR`/`ITEM_TYPE_SOFT_BG` colour maps
