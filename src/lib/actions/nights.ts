"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { pokerNights, pokerNightParticipants } from "@/lib/db/schema";
import {
  createNightSchema,
  updateNightSchema,
  updateParticipantSchema,
} from "@/lib/validators/nights";
import { getUserMembership } from "@/lib/db/queries/groups";
import { serializeNightMetadata } from "@/lib/utils/chips";

const LOCALES = ["es", "en"] as const;

function revalidateLocalized(path: string) {
  for (const locale of LOCALES) {
    revalidatePath(`/${locale}${path}`);
  }
}

async function ensureNightCreatorParticipant(nightId: string, creatorUserId: string) {
  await db
    .insert(pokerNightParticipants)
    .values({
      nightId,
      userId: creatorUserId,
      buyInCount: 1,
    })
    .onConflictDoNothing();
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

  await db
    .insert(pokerNightParticipants)
    .values({
      nightId: night.id,
      userId,
      buyInCount: 1,
    })
    .onConflictDoNothing();

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

  if (night.status !== "scheduled") {
    return { error: "La noche ya fue iniciada o finalizada" };
  }

  // Repair legacy nights created before creator auto-join was added.
  await ensureNightCreatorParticipant(night.id, night.createdBy);

  const [existingParticipant] = await db
    .select({ id: pokerNightParticipants.id })
    .from(pokerNightParticipants)
    .where(eq(pokerNightParticipants.nightId, nightId))
    .limit(1);

  if (!existingParticipant) {
    return { error: "Agrega al menos un participante antes de iniciar" };
  }

  await db
    .update(pokerNights)
    .set({ status: "in_progress", updatedAt: new Date() })
    .where(eq(pokerNights.id, nightId));

  revalidateLocalized(`/groups/${night.groupId}/nights/${nightId}`);
  return { success: true };
}

export async function updateNight(
  nightId: string,
  userId: string,
  formData: FormData
) {
  const [night] = await db
    .select()
    .from(pokerNights)
    .where(eq(pokerNights.id, nightId))
    .limit(1);

  if (!night) return { error: "Noche no encontrada" };

  const membership = await getUserMembership(night.groupId, userId);
  if (!membership || membership.role === "member") {
    return { error: "No tienes permisos para editar noches" };
  }

  const parsed = updateNightSchema.safeParse({
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

  await db
    .update(pokerNights)
    .set({
      name: parsed.data.name,
      date: parsed.data.date,
      chipValue: String(parsed.data.chipValueWhite),
      buyInAmount: String(parsed.data.buyInAmount),
      maxRebuys: parsed.data.maxRebuys ?? null,
      notes: serializedMetadata,
      updatedAt: new Date(),
    })
    .where(eq(pokerNights.id, nightId));

  revalidateLocalized(`/groups/${night.groupId}`);
  revalidateLocalized(`/groups/${night.groupId}/nights/${nightId}`);
  revalidateLocalized(`/groups/${night.groupId}/nights`);
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

  if (night.status !== "in_progress") {
    return { error: "Solo puedes finalizar noches en curso" };
  }

  // Keep old data consistent in case creator wasn't inserted originally.
  await ensureNightCreatorParticipant(night.id, night.createdBy);

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
  if (!membership || membership.role === "member") {
    return { error: "No tienes permisos" };
  }

  const targetMembership = await getUserMembership(night.groupId, targetUserId);
  if (!targetMembership) {
    return { error: "El usuario no pertenece al grupo" };
  }

  const [existingParticipant] = await db
    .select({ id: pokerNightParticipants.id })
    .from(pokerNightParticipants)
    .where(
      and(
        eq(pokerNightParticipants.nightId, nightId),
        eq(pokerNightParticipants.userId, targetUserId)
      )
    )
    .limit(1);

  if (existingParticipant) {
    return { error: "Ese jugador ya está agregado" };
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
    chipsBlackEnd: formData.get("chipsBlackEnd") || undefined,
    chipsWhiteEnd: formData.get("chipsWhiteEnd") || undefined,
    chipsRedEnd: formData.get("chipsRedEnd") || undefined,
    chipsGreenEnd: formData.get("chipsGreenEnd") || undefined,
    chipsBlueEnd: formData.get("chipsBlueEnd") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (parsed.data.buyInCount !== undefined)
    updateData.buyInCount = parsed.data.buyInCount;
  if (parsed.data.totalChipsEnd !== undefined)
    updateData.totalChipsEnd = parsed.data.totalChipsEnd;
  if (parsed.data.chipsBlackEnd !== undefined)
    updateData.chipsBlackEnd = parsed.data.chipsBlackEnd;
  if (parsed.data.chipsWhiteEnd !== undefined)
    updateData.chipsWhiteEnd = parsed.data.chipsWhiteEnd;
  if (parsed.data.chipsRedEnd !== undefined)
    updateData.chipsRedEnd = parsed.data.chipsRedEnd;
  if (parsed.data.chipsGreenEnd !== undefined)
    updateData.chipsGreenEnd = parsed.data.chipsGreenEnd;
  if (parsed.data.chipsBlueEnd !== undefined)
    updateData.chipsBlueEnd = parsed.data.chipsBlueEnd;

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

  if (participant.userId === night.createdBy) {
    return { error: "No puedes quitar al creador de la noche" };
  }

  await db
    .delete(pokerNightParticipants)
    .where(eq(pokerNightParticipants.id, participantId));

  revalidateLocalized(`/groups/${night.groupId}/nights/${night.id}`);
  return { success: true };
}
