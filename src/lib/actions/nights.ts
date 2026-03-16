"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { pokerNights, pokerNightParticipants } from "@/lib/db/schema";
import { createNightSchema, updateParticipantSchema } from "@/lib/validators/nights";
import { getUserMembership } from "@/lib/db/queries/groups";
import { serializeNightMetadata } from "@/lib/utils/chips";

const LOCALES = ["es", "en"] as const;

function revalidateLocalized(path: string) {
  for (const locale of LOCALES) {
    revalidatePath(`/${locale}${path}`);
  }
}

export async function createNight(
  groupId: string,
  userId: string,
  formData: FormData
) {
  const membership = await getUserMembership(groupId, userId);
  if (!membership || membership.role === "member") {
    return { error: "No tienes permisos para crear noches" };
  }

  const parsed = createNightSchema.safeParse({
    name: formData.get("name") || undefined,
    date: formData.get("date"),
    chipValueBlack: formData.get("chipValueBlack"),
    chipValueWhite: formData.get("chipValueWhite"),
    chipValueRed: formData.get("chipValueRed"),
    chipValueGreen: formData.get("chipValueGreen"),
    chipValueBlue: formData.get("chipValueBlue"),
    buyInAmount: formData.get("buyInAmount"),
    maxRebuys: formData.get("maxRebuys") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const serializedMetadata = serializeNightMetadata(parsed.data.notes, {
    black: parsed.data.chipValueBlack,
    white: parsed.data.chipValueWhite,
    red: parsed.data.chipValueRed,
    green: parsed.data.chipValueGreen,
    blue: parsed.data.chipValueBlue,
  });

  const [night] = await db
    .insert(pokerNights)
    .values({
      groupId,
      name: parsed.data.name,
      date: parsed.data.date,
      // Keep legacy chip_value for backward-compatible calculations.
      chipValue: String(parsed.data.chipValueWhite),
      buyInAmount: String(parsed.data.buyInAmount),
      maxRebuys: parsed.data.maxRebuys ?? null,
      notes: serializedMetadata,
      createdBy: userId,
    })
    .returning();

  revalidateLocalized(`/groups/${groupId}`);
  return { nightId: night.id };
}

export async function startNight(nightId: string, userId: string) {
  const [night] = await db
    .select()
    .from(pokerNights)
    .where(eq(pokerNights.id, nightId))
    .limit(1);

  if (!night) return { error: "Noche no encontrada" };

  const membership = await getUserMembership(night.groupId, userId);
  if (!membership || membership.role === "member") {
    return { error: "No tienes permisos" };
  }

  await db
    .update(pokerNights)
    .set({ status: "in_progress", updatedAt: new Date() })
    .where(eq(pokerNights.id, nightId));

  revalidateLocalized(`/groups/${night.groupId}/nights/${nightId}`);
  return { success: true };
}

export async function completeNight(nightId: string, userId: string) {
  const [night] = await db
    .select()
    .from(pokerNights)
    .where(eq(pokerNights.id, nightId))
    .limit(1);

  if (!night) return { error: "Noche no encontrada" };

  const membership = await getUserMembership(night.groupId, userId);
  if (!membership || membership.role === "member") {
    return { error: "No tienes permisos" };
  }

  await db
    .update(pokerNights)
    .set({ status: "completed", updatedAt: new Date() })
    .where(eq(pokerNights.id, nightId));

  revalidateLocalized(`/groups/${night.groupId}/nights/${nightId}`);
  return { success: true };
}

export async function addParticipant(
  nightId: string,
  targetUserId: string,
  currentUserId: string
) {
  const [night] = await db
    .select()
    .from(pokerNights)
    .where(eq(pokerNights.id, nightId))
    .limit(1);

  if (!night) return { error: "Noche no encontrada" };

  const membership = await getUserMembership(night.groupId, currentUserId);
  if (!membership) {
    return { error: "No eres miembro de este grupo" };
  }

  await db.insert(pokerNightParticipants).values({
    nightId,
    userId: targetUserId,
    buyInCount: 1,
  });

  revalidateLocalized(`/groups/${night.groupId}/nights/${nightId}`);
  return { success: true };
}

export async function updateParticipant(formData: FormData) {
  const parsed = updateParticipantSchema.safeParse({
    participantId: formData.get("participantId"),
    buyInCount: formData.get("buyInCount") || undefined,
    totalChipsEnd: formData.get("totalChipsEnd") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (parsed.data.buyInCount !== undefined)
    updateData.buyInCount = parsed.data.buyInCount;
  if (parsed.data.totalChipsEnd !== undefined)
    updateData.totalChipsEnd = parsed.data.totalChipsEnd;

  await db
    .update(pokerNightParticipants)
    .set(updateData)
    .where(eq(pokerNightParticipants.id, parsed.data.participantId));

  return { success: true };
}

export async function removeParticipant(
  participantId: string,
  currentUserId: string
) {
  const [participant] = await db
    .select()
    .from(pokerNightParticipants)
    .where(eq(pokerNightParticipants.id, participantId))
    .limit(1);

  if (!participant) return { error: "Participante no encontrado" };

  const [night] = await db
    .select()
    .from(pokerNights)
    .where(eq(pokerNights.id, participant.nightId))
    .limit(1);

  if (!night) return { error: "Noche no encontrada" };

  const membership = await getUserMembership(night.groupId, currentUserId);
  if (!membership || membership.role === "member") {
    return { error: "No tienes permisos" };
  }

  await db
    .delete(pokerNightParticipants)
    .where(eq(pokerNightParticipants.id, participantId));

  revalidateLocalized(`/groups/${night.groupId}/nights/${night.id}`);
  return { success: true };
}
