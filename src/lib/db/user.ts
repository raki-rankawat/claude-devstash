import { prisma } from "@/lib/prisma";

/** The seeded demo account. Stand-in until NextAuth lands. */
const DEMO_USER_EMAIL = "demo@devstash.io";

/**
 * Resolves the user whose data the dashboard renders. Returns null when the
 * demo user is missing (i.e. the seed has not been run) so callers can fall
 * back to an empty state instead of throwing.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { email: DEMO_USER_EMAIL },
    select: { id: true },
  });

  return user?.id ?? null;
}
