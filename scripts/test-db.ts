import "dotenv/config";

import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";

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

// Must match prisma/seed.ts.
const DEMO_EMAIL = "demo@devstash.io";
const DEMO_PASSWORD = "12345678";
const EXPECTED_COLLECTIONS = 5;
const EXPECTED_ITEMS = 18;

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

function section(title: string) {
  console.log(`\n${title}\n`);
}

async function checkSchema() {
  section("Schema");

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
}

async function checkDemoData() {
  section("Demo data");

  const user = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });

  if (!user) {
    console.log(`  FAIL  demo user exists — ${DEMO_EMAIL} not found, run \`npm run db:seed\``);
    failed++;
    return;
  }

  await check("demo user exists", async () => {
    assert(user.name === "Demo User", `name is "${user.name}"`);
    assert(user.isPro === false, "isPro should be false");
    assert(user.emailVerified !== null, "emailVerified is not set");
    return `${user.email} — "${user.name}", isPro=${user.isPro}, verified ${user.emailVerified?.toISOString().slice(0, 10)}`;
  });

  await check("password is a valid bcrypt hash", async () => {
    assert(user.password !== null, "no password stored");
    const hash = user.password!;
    const rounds = hash.split("$")[2];
    assert(hash.startsWith("$2"), "not a bcrypt hash");
    assert(rounds === "12", `hashed with ${rounds} rounds, expected 12`);
    assert(
      await bcrypt.compare(DEMO_PASSWORD, hash),
      "the seeded password does not verify",
    );
    assert(
      !(await bcrypt.compare("wrong-password", hash)),
      "an incorrect password verified",
    );
    return `${rounds} rounds, verifies correctly and rejects a wrong password`;
  });

  const collections = await loadCollections(user.id);

  const items = await prisma.item.findMany({
    where: { userId: user.id },
    include: { itemType: true, collections: true },
  });

  await check("collections seeded", async () => {
    assert(
      collections.length === EXPECTED_COLLECTIONS,
      `found ${collections.length}, expected ${EXPECTED_COLLECTIONS}`,
    );
    return collections.map((c) => c.name).join(", ");
  });

  await check("items seeded", async () => {
    assert(
      items.length === EXPECTED_ITEMS,
      `found ${items.length}, expected ${EXPECTED_ITEMS}`,
    );
    const byType = new Map<string, number>();
    for (const item of items) {
      byType.set(item.itemType.name, (byType.get(item.itemType.name) ?? 0) + 1);
    }
    return [...byType.entries()]
      .sort()
      .map(([name, count]) => `${count} ${name}`)
      .join(", ");
  });

  await check("every item belongs to a collection", async () => {
    const orphans = items.filter((i) => i.collections.length === 0);
    assert(orphans.length === 0, `orphans: ${orphans.map((i) => i.title).join(", ")}`);
    return `${items.length} items linked`;
  });

  await check("contentType matches item type", async () => {
    const wrong = items.filter(
      (i) => i.contentType !== (i.itemType.name === "link" ? "URL" : "TEXT"),
    );
    assert(
      wrong.length === 0,
      wrong.map((i) => `${i.title} is ${i.contentType}`).join(", "),
    );
    return "links are URL, everything else is TEXT";
  });

  await check("links point at real URLs", async () => {
    const links = items.filter((i) => i.itemType.name === "link");
    const bad = links.filter((i) => !i.url?.startsWith("https://"));
    assert(bad.length === 0, `missing https url: ${bad.map((i) => i.title).join(", ")}`);
    return `${links.length} links, all https`;
  });

  await check("text items have content", async () => {
    const texts = items.filter((i) => i.contentType === "TEXT");
    const empty = texts.filter((i) => !i.content);
    assert(empty.length === 0, `empty: ${empty.map((i) => i.title).join(", ")}`);
    const unhighlighted = texts.filter(
      (i) => i.itemType.name === "snippet" && !i.language,
    );
    assert(
      unhighlighted.length === 0,
      `snippets without a language: ${unhighlighted.map((i) => i.title).join(", ")}`,
    );
    return `${texts.length} text items, snippets all carry a language`;
  });

  await check("dashboard has pinned and favourite data", async () => {
    const pinned = items.filter((i) => i.isPinned).length;
    const favItems = items.filter((i) => i.isFavorite).length;
    const favCollections = collections.filter((c) => c.isFavorite).length;
    assert(pinned > 0, "nothing is pinned");
    assert(favItems > 0, "no favourite items");
    assert(favCollections > 0, "no favourite collections");
    return `${pinned} pinned, ${favItems} favourite items, ${favCollections} favourite collections`;
  });

  displayDemoData(collections, items);
}

type DemoCollections = Awaited<ReturnType<typeof loadCollections>>;

async function loadCollections(userId: string) {
  return prisma.collection.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    include: {
      defaultType: true,
      items: {
        orderBy: { item: { title: "asc" } },
        include: { item: { include: { itemType: true, tags: true } } },
      },
    },
  });
}

function displayDemoData(
  collections: DemoCollections,
  items: { isPinned: boolean; isFavorite: boolean }[],
) {
  section("Demo data contents");

  const stats = [
    `${items.length} items`,
    `${collections.length} collections`,
    `${items.filter((i) => i.isFavorite).length} favourite items`,
    `${collections.filter((c) => c.isFavorite).length} favourite collections`,
    `${items.filter((i) => i.isPinned).length} pinned`,
  ];
  console.log(`  ${stats.join("  |  ")}\n`);

  for (const collection of collections) {
    const badges = [
      `default: ${collection.defaultType?.name ?? "none"}`,
      collection.isFavorite ? "favourite" : null,
    ].filter(Boolean);

    console.log(
      `  ${collection.name}  (${badges.join(", ")})\n    ${collection.description ?? ""}`,
    );

    for (const { item } of collection.items) {
      const flags = [item.isPinned ? "pinned" : null, item.isFavorite ? "fav" : null]
        .filter(Boolean)
        .join(",");
      const detail =
        item.contentType === "URL"
          ? item.url
          : `${item.language ?? "text"}, ${item.content?.length ?? 0} chars`;

      console.log(
        `      [${item.itemType.name.padEnd(7)}] ${item.title.padEnd(36)} ${detail}` +
          (flags ? `  (${flags})` : ""),
      );
      if (item.tags.length > 0) {
        console.log(`${" ".repeat(16)}tags: ${item.tags.map((t) => t.name).join(", ")}`);
      }
    }
    console.log("");
  }
}

async function checkWrites() {
  section("Write round-trip");

  // Everything hangs off one throwaway user, so deleting that user at the end
  // cascades the whole fixture away without touching the demo data.
  const email = `test-${Date.now()}@devstash.local`;
  const tagName = `test-tag-${Date.now()}`;
  let userId: string | null = null;

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
      const item = await prisma.item.findFirstOrThrow({
        where: { userId: userId! },
      });
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
}

async function main() {
  console.log("\nDevStash database check");

  await checkSchema();
  await checkDemoData();
  await checkWrites();

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
