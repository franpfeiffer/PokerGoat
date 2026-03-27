"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { pokerNights, pokerNightParticipants } from "@/lib/db/schema";
import {
  createNightSchema,
  updateNightSchema,
  updateParticipantSchema,
} from "@/lib/validators/nights";
import { getUserMembership } from "@/lib/db/queries/groups";
import { getUpcomingNightsForUser } from "@/lib/db/queries/nights";
import { getUserByAuthId } from "@/lib/db/queries/users";
import { insertActivity } from "@/lib/db/queries/activity";
import { pushNotify } from "@/lib/push/send";
import { serializeNightMetadata } from "@/lib/utils/chips";
import { isRateLimited } from "@/lib/utils/rate-limit";
import { revalidateLocalized } from "@/lib/utils/revalidate";
import { revalidateTag } from "next/cache";

export async function getUpcomingNightsAction(authUserId: string) {
  const user = await getUserByAuthId(authUserId);
  if (!user) return [];
  return getUpcomingNightsForUser(user.id);
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
  // Rate limit: max 10 nights created per user per hour
  if (isRateLimited(`create-night:${userId}`, 10, 60 * 60_000)) {
    return { error: "Demasiadas noches creadas. Probá de nuevo más tarde." };
  }

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
    chipQtyBlack: formData.get("chipQtyBlack") || undefined,
    chipQtyWhite: formData.get("chipQtyWhite") || undefined,
    chipQtyRed: formData.get("chipQtyRed") || undefined,
    chipQtyGreen: formData.get("chipQtyGreen") || undefined,
    chipQtyBlue: formData.get("chipQtyBlue") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const hasChipQty =
    parsed.data.chipQtyBlack !== undefined ||
    parsed.data.chipQtyWhite !== undefined ||
    parsed.data.chipQtyRed !== undefined ||
    parsed.data.chipQtyGreen !== undefined ||
    parsed.data.chipQtyBlue !== undefined;

  const chipQuantities = hasChipQty
    ? {
        black: parsed.data.chipQtyBlack ?? 0,
        white: parsed.data.chipQtyWhite ?? 0,
        red: parsed.data.chipQtyRed ?? 0,
        green: parsed.data.chipQtyGreen ?? 0,
        blue: parsed.data.chipQtyBlue ?? 0,
      }
    : undefined;

  const serializedMetadata = serializeNightMetadata(
    parsed.data.notes,
    {
      black: parsed.data.chipValueBlack,
      white: parsed.data.chipValueWhite,
      red: parsed.data.chipValueRed,
      green: parsed.data.chipValueGreen,
      blue: parsed.data.chipValueBlue,
    },
    chipQuantities
  );

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

  await insertActivity({
    groupId,
    type: "night_created",
    actorId: userId,
    targetId: night.id,
    metadata: { nightName: parsed.data.name, date: parsed.data.date },
  }).catch(() => {});

  pushNotify
    .nightScheduled(
      groupId,
      night.name ?? "Nueva noche de poker",
      night.id,
      userId
    )
    .catch(() => {});

  revalidateLocalized(`/groups/${groupId}`);
  revalidateTag(`group-${groupId}`, "max");
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

  pushNotify
    .nightStarted(
      night.groupId,
      night.name ?? "Noche de poker",
      nightId
    )
    .catch(() => {});

  revalidateLocalized(`/groups/${night.groupId}/nights/${nightId}`);
  revalidateTag(`night-${nightId}`, "max");
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
    chipQtyBlack: formData.get("chipQtyBlack") || undefined,
    chipQtyWhite: formData.get("chipQtyWhite") || undefined,
    chipQtyRed: formData.get("chipQtyRed") || undefined,
    chipQtyGreen: formData.get("chipQtyGreen") || undefined,
    chipQtyBlue: formData.get("chipQtyBlue") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const hasChipQty =
    parsed.data.chipQtyBlack !== undefined ||
    parsed.data.chipQtyWhite !== undefined ||
    parsed.data.chipQtyRed !== undefined ||
    parsed.data.chipQtyGreen !== undefined ||
    parsed.data.chipQtyBlue !== undefined;

  const chipQuantities = hasChipQty
    ? {
        black: parsed.data.chipQtyBlack ?? 0,
        white: parsed.data.chipQtyWhite ?? 0,
        red: parsed.data.chipQtyRed ?? 0,
        green: parsed.data.chipQtyGreen ?? 0,
        blue: parsed.data.chipQtyBlue ?? 0,
      }
    : undefined;

  const serializedMetadata = serializeNightMetadata(
    parsed.data.notes,
    {
      black: parsed.data.chipValueBlack,
      white: parsed.data.chipValueWhite,
      red: parsed.data.chipValueRed,
      green: parsed.data.chipValueGreen,
      blue: parsed.data.chipValueBlue,
    },
    chipQuantities
  );

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
  revalidateTag(`night-${nightId}`, "max");
  revalidateTag(`group-${night.groupId}`, "max");
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
  revalidateTag(`night-${nightId}`, "max");
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
  revalidateTag(`night-${nightId}`, "max");
  return { success: true };
}

export async function updateParticipant(formData: FormData) {
  const parsed = updateParticipantSchema.safeParse({
    participantId: formData.get("participantId"),
    buyInCount: formData.get("buyInCount") || undefined,
    rebuyAmount: formData.get("rebuyAmount") || undefined,
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
  if (parsed.data.rebuyAmount !== undefined)
    updateData.rebuyTotal = String(parsed.data.rebuyAmount);
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
  revalidateTag(`night-${night.id}`, "max");
  return { success: true };
}
