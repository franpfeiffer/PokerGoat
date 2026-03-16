"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { pokerNights, pokerNightParticipants } from "@/lib/db/schema";
import { createNightSchema, updateParticipantSchema } from "@/lib/validators/nights";
import { getUserMembership } from "@/lib/db/queries/groups";

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
    chipValue: formData.get("chipValue"),
    buyInAmount: formData.get("buyInAmount"),
    maxRebuys: formData.get("maxRebuys") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const [night] = await db
    .insert(pokerNights)
    .values({
      groupId,
      name: parsed.data.name,
      date: parsed.data.date,
      chipValue: String(parsed.data.chipValue),
      buyInAmount: String(parsed.data.buyInAmount),
      maxRebuys: parsed.data.maxRebuys ?? null,
      notes: parsed.data.notes,
      createdBy: userId,
    })
    .returning();

  revalidatePath(`/groups/${groupId}`);
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

  revalidatePath(`/groups/${night.groupId}/nights/${nightId}`);
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

  revalidatePath(`/groups/${night.groupId}/nights/${nightId}`);
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

  revalidatePath(`/groups/${night.groupId}/nights/${nightId}`);
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

  revalidatePath(`/groups/${night.groupId}/nights/${night.id}`);
  return { success: true };
}
