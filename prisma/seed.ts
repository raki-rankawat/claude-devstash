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

const DEMO_EMAIL = "demo@devstash.io";
const DEMO_PASSWORD = "12345678";
const BCRYPT_ROUNDS = 12;

const SYSTEM_ITEM_TYPES = [
  { name: "snippet", icon: "Code", color: "#3b82f6", isSystem: true },
  { name: "prompt", icon: "Sparkles", color: "#8b5cf6", isSystem: true },
  { name: "command", icon: "Terminal", color: "#f97316", isSystem: true },
  { name: "note", icon: "StickyNote", color: "#fde047", isSystem: true },
  { name: "file", icon: "File", color: "#6b7280", isSystem: true },
  { name: "image", icon: "Image", color: "#ec4899", isSystem: true },
  { name: "link", icon: "Link", color: "#10b981", isSystem: true },
];

type SeedItem = {
  title: string;
  type: string;
  description: string;
  content?: string;
  url?: string;
  language?: string;
  tags?: string[];
  isPinned?: boolean;
  isFavorite?: boolean;
};

type SeedCollection = {
  name: string;
  description: string;
  defaultType: string | null;
  isFavorite?: boolean;
  items: SeedItem[];
};

const COLLECTIONS: SeedCollection[] = [
  {
    name: "React Patterns",
    description: "Reusable React patterns and hooks",
    defaultType: "snippet",
    isFavorite: true,
    items: [
      {
        title: "useDebounce hook",
        type: "snippet",
        language: "typescript",
        description: "Delays a rapidly changing value — search inputs, autosave, resize handlers.",
        tags: ["react", "hooks", "typescript"],
        isPinned: true,
        isFavorite: true,
        content: `import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}`,
      },
      {
        title: "useLocalStorage hook",
        type: "snippet",
        language: "typescript",
        description: "State that survives a reload. Reads lazily so SSR does not touch window.",
        tags: ["react", "hooks", "typescript"],
        content: `import { useCallback, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [stored, setStored] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T) => {
      setStored(value);
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch {
        // Quota exceeded or storage disabled — keep the in-memory value.
      }
    },
    [key],
  );

  return [stored, setValue] as const;
}`,
      },
      {
        title: "Typed context provider",
        type: "snippet",
        language: "typescript",
        description:
          "Context factory whose hook throws outside the provider, so the value is never null downstream.",
        tags: ["react", "context", "typescript"],
        isFavorite: true,
        content: `import { createContext, useContext } from "react";

export function createRequiredContext<T>(name: string) {
  const Context = createContext<T | null>(null);

  function useRequiredContext(): T {
    const value = useContext(Context);
    if (value === null) {
      throw new Error(\`use\${name} must be used inside <\${name}Provider>\`);
    }
    return value;
  }

  return [Context.Provider, useRequiredContext] as const;
}`,
      },
    ],
  },
  {
    name: "AI Workflows",
    description: "AI prompts and workflow automations",
    defaultType: "prompt",
    isFavorite: true,
    items: [
      {
        title: "Code review prompt",
        type: "prompt",
        description: "Asks for a severity-ranked review instead of a wall of nitpicks.",
        tags: ["review", "quality"],
        isPinned: true,
        content: `Review the diff below as a senior engineer on this codebase.

Rank every finding by severity: correctness bugs first, then security, then
performance, then style. For each one give the file and line, what breaks, and
a concrete failure case — inputs or state that produce the wrong result.

Do not restate what the code does. Do not comment on formatting a linter would
catch. If you find nothing above style level, say so plainly.

Diff:
"""
{{diff}}
"""`,
      },
      {
        title: "Documentation generation prompt",
        type: "prompt",
        description: "Generates reference docs from source without inventing behaviour.",
        tags: ["docs", "writing"],
        content: `Write reference documentation for the module below.

Cover: what it is for, every exported function with parameters, return value
and thrown errors, and one realistic usage example per export.

Constraints:
- Base every claim on the source. If behaviour is ambiguous, mark it TODO
  rather than guessing.
- Document error paths, not just the happy path.
- Match the tone of existing docs: direct, second person, no marketing.

Source:
"""
{{source}}
"""`,
      },
      {
        title: "Refactoring assistance prompt",
        type: "prompt",
        description: "Refactors in reviewable steps, each one behaviour-preserving.",
        tags: ["refactor", "quality"],
        content: `Refactor the code below for {{goal}} (e.g. readability, testability).

Work in small steps. For each step give: the change, why it helps, and why it
cannot alter observable behaviour. Stop and flag it if a step would change the
public API or any side effect.

Do not rename things for taste alone, do not reorganise files, and do not add
abstraction that has exactly one caller.

Code:
"""
{{code}}
"""`,
      },
    ],
  },
  {
    name: "DevOps",
    description: "Infrastructure and deployment resources",
    defaultType: null,
    items: [
      {
        title: "Multi-stage Node Dockerfile",
        type: "snippet",
        language: "dockerfile",
        description: "Builds in one stage, ships only production deps and a non-root user.",
        tags: ["docker", "node", "deployment"],
        isFavorite: true,
        content: `# syntax=docker/dockerfile:1
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -g 1001 nodejs && adduser -u 1001 -G nodejs -S nextjs
COPY --from=build --chown=nextjs:nodejs /app/.next ./.next
COPY --from=build --chown=nextjs:nodejs /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nextjs:nodejs /app/package.json ./package.json
USER nextjs
EXPOSE 3000
CMD ["npm", "start"]`,
      },
      {
        title: "Deploy with migrations",
        type: "command",
        language: "bash",
        description: "Applies pending migrations before starting — order matters on rollout.",
        tags: ["deployment", "prisma"],
        isPinned: true,
        content: `npx prisma migrate deploy && npm run build && npm start`,
      },
      {
        title: "Docker documentation",
        type: "link",
        url: "https://docs.docker.com/",
        description: "Official Docker reference — Dockerfile syntax, Compose, build cache.",
        tags: ["docker", "reference"],
      },
      {
        title: "GitHub Actions documentation",
        type: "link",
        url: "https://docs.github.com/en/actions",
        description: "Workflow syntax, triggers, matrix builds and reusable workflows.",
        tags: ["ci", "reference"],
      },
    ],
  },
  {
    name: "Terminal Commands",
    description: "Useful shell commands for everyday development",
    defaultType: "command",
    items: [
      {
        title: "Undo last commit, keep changes",
        type: "command",
        language: "bash",
        description: "Moves HEAD back one commit but leaves the work in the tree. Not --hard.",
        tags: ["git"],
        isPinned: true,
        isFavorite: true,
        content: `git reset --soft HEAD~1`,
      },
      {
        title: "Prune Docker disk usage",
        type: "command",
        language: "bash",
        description: "Removes stopped containers, unused networks, dangling images and build cache.",
        tags: ["docker", "cleanup"],
        content: `docker system prune -af --volumes`,
      },
      {
        title: "Find and kill the process on a port",
        type: "command",
        language: "bash",
        description: "For when a dev server has already claimed 3000.",
        tags: ["process", "debugging"],
        content: `# macOS / Linux
lsof -ti tcp:3000 | xargs kill -9

# Windows (PowerShell)
Get-NetTCPConnection -LocalPort 3000 | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }`,
      },
      {
        title: "Audit and dedupe npm dependencies",
        type: "command",
        language: "bash",
        description: "Shows what is outdated, flattens duplicates, then fixes non-breaking advisories.",
        tags: ["npm", "maintenance"],
        content: `npm outdated; npm dedupe && npm audit fix`,
      },
    ],
  },
  {
    name: "Design Resources",
    description: "UI/UX resources and references",
    defaultType: "link",
    items: [
      {
        title: "Tailwind CSS documentation",
        type: "link",
        url: "https://tailwindcss.com/docs",
        description: "Utility reference and the v4 CSS-first theme configuration.",
        tags: ["css", "tailwind", "reference"],
        isFavorite: true,
      },
      {
        title: "shadcn/ui",
        type: "link",
        url: "https://ui.shadcn.com",
        description: "Copy-in accessible components built on Radix — the library this project uses.",
        tags: ["components", "react"],
        isPinned: true,
      },
      {
        title: "Material Design 3",
        type: "link",
        url: "https://m3.material.io",
        description: "Design system reference for colour roles, elevation and typography scales.",
        tags: ["design-system", "reference"],
      },
      {
        title: "Lucide icons",
        type: "link",
        url: "https://lucide.dev",
        description: "The icon set DevStash uses for item types. Searchable, MIT licensed.",
        tags: ["icons", "reference"],
      },
    ],
  },
];

function contentTypeFor(type: string) {
  return type === "link" ? "URL" : "TEXT";
}

async function main() {
  console.log("Seeding...");

  // System types are shared and referenced by items via a RESTRICT foreign key,
  // so they are looked up and updated in place rather than deleted. Postgres
  // treats the null userId as distinct in the [name, userId] unique index, so
  // upsert would insert a duplicate set on every run.
  const itemTypes = new Map<string, string>();

  for (const type of SYSTEM_ITEM_TYPES) {
    const existing = await prisma.itemType.findFirst({
      where: { name: type.name, userId: null },
    });

    const saved = existing
      ? await prisma.itemType.update({ where: { id: existing.id }, data: type })
      : await prisma.itemType.create({ data: type });

    itemTypes.set(saved.name, saved.id);
  }

  console.log(`  ${SYSTEM_ITEM_TYPES.length} system item types`);

  // Re-runnable: dropping the demo user cascades their items, collections and
  // join rows. Nothing outside this user's data is touched.
  await prisma.user.deleteMany({ where: { email: DEMO_EMAIL } });

  const user = await prisma.user.create({
    data: {
      email: DEMO_EMAIL,
      name: "Demo User",
      isPro: false,
      emailVerified: new Date(),
      password: await bcrypt.hash(DEMO_PASSWORD, BCRYPT_ROUNDS),
    },
  });

  console.log(`  demo user ${user.email}`);

  let itemCount = 0;

  for (const collection of COLLECTIONS) {
    const created = await prisma.collection.create({
      data: {
        name: collection.name,
        description: collection.description,
        isFavorite: collection.isFavorite ?? false,
        userId: user.id,
        defaultTypeId: collection.defaultType
          ? itemTypes.get(collection.defaultType)
          : null,
      },
    });

    for (const item of collection.items) {
      const itemTypeId = itemTypes.get(item.type);

      if (!itemTypeId) {
        throw new Error(`Unknown item type "${item.type}" on "${item.title}"`);
      }

      await prisma.item.create({
        data: {
          title: item.title,
          contentType: contentTypeFor(item.type),
          content: item.content ?? null,
          url: item.url ?? null,
          description: item.description,
          language: item.language ?? null,
          isPinned: item.isPinned ?? false,
          isFavorite: item.isFavorite ?? false,
          userId: user.id,
          itemTypeId,
          collections: { create: { collectionId: created.id } },
          tags: {
            connectOrCreate: (item.tags ?? []).map((name) => ({
              where: { name },
              create: { name },
            })),
          },
        },
      });

      itemCount++;
    }

    console.log(
      `  ${collection.name} — ${collection.items.length} item${collection.items.length === 1 ? "" : "s"}`,
    );
  }

  // Tags are global rather than user-owned, so re-running leaves behind any
  // that no longer belong to an item.
  const orphanedTags = await prisma.tag.deleteMany({ where: { items: { none: {} } } });

  console.log(
    `\nSeeded ${COLLECTIONS.length} collections and ${itemCount} items` +
      (orphanedTags.count > 0 ? ` (removed ${orphanedTags.count} orphaned tags)` : ""),
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
