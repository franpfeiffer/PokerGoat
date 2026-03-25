import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { pushSubscriptions, userProfiles } from "@/lib/db/schema";
import { auth } from "@/lib/auth/server";

async function getProfileId(authUserId: string): Promise<string | null> {
  const [profile] = await db
    .select({ id: userProfiles.id })
    .from(userProfiles)
    .where(eq(userProfiles.authUserId, authUserId))
    .limit(1);
  return profile?.id ?? null;
}

async function getSession() {
  if (!auth) return null;
  try {
    // auth.getSession() reads from Next.js cookie store automatically in route handlers
    const { data } = await auth.getSession();
    return data;
  } catch {
    return null;
  }
}

// POST /api/push — registrar subscription
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { endpoint, keys } = body as {
    endpoint: string;
    keys: { p256dh: string; auth: string };
  };

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
  }

  const userId = await getProfileId(session.user.id);
  if (!userId) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  await db
    .insert(pushSubscriptions)
    .values({ userId, endpoint, p256dh: keys.p256dh, auth: keys.auth })
    .onConflictDoNothing();

  return NextResponse.json({ ok: true });
}

// DELETE /api/push — desregistrar subscription
export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { endpoint } = body as { endpoint: string };

  if (!endpoint) {
    return NextResponse.json({ error: "Missing endpoint" }, { status: 400 });
  }

  const userId = await getProfileId(session.user.id);
  if (!userId) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  await db
    .delete(pushSubscriptions)
    .where(
      and(
        eq(pushSubscriptions.userId, userId),
        eq(pushSubscriptions.endpoint, endpoint)
      )
    );

  return NextResponse.json({ ok: true });
}
