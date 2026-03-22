import { eq } from "drizzle-orm";
import { db } from "..";
import { subscriptions } from "../schema";

export async function getSubscriptionByUserId(userId: string) {
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);
  return sub ?? null;
}

export async function getSubscriptionByPreapprovalId(preapprovalId: string) {
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.mpPreapprovalId, preapprovalId))
    .limit(1);
  return sub ?? null;
}

export async function createSubscriptionRecord(data: {
  userId: string;
  mpPreapprovalId: string;
  mpPayerEmail: string;
  amount: string;
  currency: string;
  status?: "pending" | "authorized" | "paused" | "cancelled";
}) {
  const [sub] = await db
    .insert(subscriptions)
    .values(data)
    .onConflictDoUpdate({
      target: subscriptions.userId,
      set: {
        mpPreapprovalId: data.mpPreapprovalId,
        mpPayerEmail: data.mpPayerEmail,
        status: data.status ?? "pending",
        amount: data.amount,
        currency: data.currency,
        updatedAt: new Date(),
      },
    })
    .returning();
  return sub;
}

export async function updateSubscriptionStatus(
  preapprovalId: string,
  data: {
    status: "pending" | "authorized" | "paused" | "cancelled";
    currentPeriodStart?: Date;
    currentPeriodEnd?: Date;
  }
) {
  const [sub] = await db
    .update(subscriptions)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(subscriptions.mpPreapprovalId, preapprovalId))
    .returning();
  return sub ?? null;
}
