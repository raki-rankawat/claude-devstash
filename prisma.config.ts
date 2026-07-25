import "dotenv/config";

import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Migrations and introspection run over a direct (unpooled) Neon
    // connection. The pooled DATABASE_URL is used by the app at runtime only —
    // PgBouncer in transaction mode can't run the DDL the schema engine emits.
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  },
});
