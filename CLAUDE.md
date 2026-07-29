# DevStash

A developer knowledge hub for snippets, commands, prompts, notes, files, images, links and custom types.

## Context Files

Read the following to get the full context of the project:

- @context/project-overview.md
- @context/coding-standards.md
- @context/ai-interaction.md
- @context/current-feature.md

## Commands

```bash
npm run dev      # dev server (Turbopack) on :3000
npm run build    # production build (Turbopack)
npm start        # serve the production build
npm run lint     # bare `eslint` — see note below
npx next typegen # regenerate PageProps/LayoutProps/RouteContext type helpers
```

## Database (Neon MCP)

All Neon MCP calls for this project target:

| Field    | Value                                      |
| -------- | ------------------------------------------ |
| Project  | `devstash` — `lucky-haze-54989807`         |
| Branch   | `development` — `br-damp-morning-asituvc0` |
| Database | `neondb`                                   |

**Always pass both `projectId` and `branchId` explicitly.** `run_sql`,
`run_sql_transaction`, `get_database_tables`, `describe_table_schema` and
`explain_sql_statement` all fall back to the project's _default_ branch when
`branchId` is omitted — and the default branch here is `production`
(`br-super-boat-as2o3t6e`), not development. Omitting it silently reads or
writes the wrong branch.

- Never run writes (`INSERT`/`UPDATE`/`DELETE`/`DROP`/`TRUNCATE`) or migrations
  against `production`. Ask first if a task seems to need it.
- Do not use the Neon MCP migration tools (`prepare_database_migration` /
  `complete_database_migration`) for schema changes — schema is owned by Prisma,
  so use `npx prisma migrate dev` per the migration rule in
  @context/project-overview.md. Neon MCP is for reading and ad-hoc queries.
- Prisma maps models to snake_case tables (`items`, `item_types`,
  `item_collections`) but leaves columns camelCase, so raw SQL must
  double-quote them: `SELECT "isFavorite" FROM collections`.
