import "dotenv/config";

import { PrismaNeon } from "@prisma/adapter-neon";

import { PrismaClient } from "../src/generated/prisma/client";

// Prisma 7 does not load .env automatically — hence the dotenv import above.
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString }),
});

const SYSTEM_TYPES = [
  "snippet",
  "prompt",
  "command",
  "note",
  "file",
  "image",
  "link",
];

let passed = 0;
let failed = 0;

async function check(name: string, fn: () => Promise<string>) {
  try {
    const detail = await fn();
    console.log(`  PASS  ${name}${detail ? ` — ${detail}` : ""}`);
    passed++;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`  FAIL  ${name} — ${message}`);
    failed++;
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

async function main() {
  console.log("\nDevStash database check\n");

  await check("connects to Neon", async () => {
    // current_database() is cast to text because Prisma cannot deserialize
    // Postgres' internal `name` type.
    const rows = await prisma.$queryRaw<
      { db: string }[]
    >`select current_database()::text as db`;
    return `database "${rows[0].db}"`;
  });

  await check("migrations applied", async () => {
    const rows = await prisma.$queryRaw<{ name: string }[]>`
      select migration_name::text as name from _prisma_migrations
      where finished_at is not null and rolled_back_at is null
      order by finished_at`;
    assert(rows.length > 0, "no completed migrations found");
    return `${rows.length} applied, latest "${rows[rows.length - 1].name}"`;
  });

  await check("system item types seeded", async () => {
    const types = await prisma.itemType.findMany({
      where: { isSystem: true, userId: null },
      select: { name: true },
    });
    const found = types.map((t) => t.name).sort();
    const missing = SYSTEM_TYPES.filter((t) => !found.includes(t));
    assert(missing.length === 0, `missing types: ${missing.join(", ")}`);
    assert(
      found.length === SYSTEM_TYPES.length,
      `expected ${SYSTEM_TYPES.length} system types, found ${found.length} (duplicates?)`,
    );
    return found.join(", ");
  });

  // Round-trip write test. Everything hangs off one user, so deleting that
  // user at the end cascades the whole fixture away.
  const email = `test-${Date.now()}@devstash.local`;
  let userId: string | null = null;
  const tagName = `test-tag-${Date.now()}`;

  try {
    await check("creates a user", async () => {
      const user = await prisma.user.create({
        data: { email, name: "DB Check User" },
      });
      userId = user.id;
      return user.id;
    });

    await check("creates an item with a tag", async () => {
      const snippet = await prisma.itemType.findFirstOrThrow({
        where: { name: "snippet", userId: null },
      });
      const item = await prisma.item.create({
        data: {
          title: "Test snippet",
          contentType: "TEXT",
          content: "console.log('hi');",
          language: "typescript",
          userId: userId!,
          itemTypeId: snippet.id,
          tags: { create: { name: tagName } },
        },
        include: { tags: true, itemType: true },
      });
      assert(item.tags.length === 1, "tag was not attached");
      assert(item.itemType.name === "snippet", "wrong item type resolved");
      return `"${item.title}" (${item.itemType.name}, tag "${item.tags[0].name}")`;
    });

    await check("links an item to a collection", async () => {
      const item = await prisma.item.findFirstOrThrow({ where: { userId: userId! } });
      const collection = await prisma.collection.create({
        data: {
          name: "Test Collection",
          userId: userId!,
          items: { create: { itemId: item.id } },
        },
        include: { items: { include: { item: true } } },
      });
      assert(collection.items.length === 1, "join row was not created");
      assert(
        collection.items[0].item.id === item.id,
        "join row points at the wrong item",
      );
      return `"${collection.name}" contains "${collection.items[0].item.title}"`;
    });

    await check("enforces the unique email constraint", async () => {
      try {
        await prisma.user.create({ data: { email } });
      } catch {
        return "duplicate email rejected";
      }
      throw new Error("duplicate email was accepted");
    });

    await check("blocks deleting an item type still in use", async () => {
      const snippet = await prisma.itemType.findFirstOrThrow({
        where: { name: "snippet", userId: null },
      });
      try {
        await prisma.itemType.delete({ where: { id: snippet.id } });
      } catch {
        return "restrict rule held";
      }
      throw new Error("in-use item type was deleted — RESTRICT is not applied");
    });
  } finally {
    if (userId) {
      await check("cascade-deletes the test fixture", async () => {
        await prisma.user.delete({ where: { id: userId! } });
        const items = await prisma.item.count({ where: { userId: userId! } });
        const collections = await prisma.collection.count({
          where: { userId: userId! },
        });
        assert(
          items === 0 && collections === 0,
          `orphans left behind: ${items} items, ${collections} collections`,
        );
        // Tags are global, so they are not cascaded with the user.
        await prisma.tag.deleteMany({ where: { name: tagName } });
        return "user, items and collections removed";
      });
    }
  }

  console.log(`\n${passed} passed, ${failed} failed\n`);

  if (failed > 0) {
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error("\nDatabase check failed to run:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
