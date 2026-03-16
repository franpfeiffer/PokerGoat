"use server";

import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { groups, groupMembers, joinRequests } from "@/lib/db/schema";
import { createGroupSchema, updateGroupSchema, joinGroupSchema } from "@/lib/validators/groups";
import { generateInviteCode } from "@/lib/utils/chips";
import { getGroupByInviteCode, getUserMembership } from "@/lib/db/queries/groups";

export async function createGroup(userId: string, formData: FormData) {
  const parsed = createGroupSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    defaultChipValue: formData.get("defaultChipValue"),
    defaultBuyIn: formData.get("defaultBuyIn"),
    currency: formData.get("currency"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const inviteCode = generateInviteCode();

  const [group] = await db
    .insert(groups)
    .values({
      ...parsed.data,
      defaultChipValue: String(parsed.data.defaultChipValue),
      defaultBuyIn: String(parsed.data.defaultBuyIn),
      inviteCode,
      createdBy: userId,
    })
    .returning();

  await db.insert(groupMembers).values({
    groupId: group.id,
    userId,
    role: "leader",
  });

  revalidatePath("/dashboard");
  return { groupId: group.id };
}

export async function updateGroup(
  groupId: string,
  userId: string,
  formData: FormData
) {
  const membership = await getUserMembership(groupId, userId);
  if (!membership || membership.role === "member") {
    return { error: "No tienes permisos para editar este grupo" };
  }

  const parsed = updateGroupSchema.safeParse({
    name: formData.get("name") || undefined,
    description: formData.get("description") || undefined,
    defaultChipValue: formData.get("defaultChipValue") || undefined,
    defaultBuyIn: formData.get("defaultBuyIn") || undefined,
    currency: formData.get("currency") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (parsed.data.name) updateData.name = parsed.data.name;
  if (parsed.data.description !== undefined)
    updateData.description = parsed.data.description;
  if (parsed.data.defaultChipValue)
    updateData.defaultChipValue = String(parsed.data.defaultChipValue);
  if (parsed.data.defaultBuyIn)
    updateData.defaultBuyIn = String(parsed.data.defaultBuyIn);
  if (parsed.data.currency) updateData.currency = parsed.data.currency;

  await db.update(groups).set(updateData).where(eq(groups.id, groupId));

  revalidatePath(`/groups/${groupId}`);
  return { success: true };
}

export async function requestJoinGroup(userId: string, formData: FormData) {
  const parsed = joinGroupSchema.safeParse({
    inviteCode: formData.get("inviteCode"),
  });

  if (!parsed.success) {
    return { error: "C\u00f3digo inv\u00e1lido" };
  }

  const group = await getGroupByInviteCode(parsed.data.inviteCode);
  if (!group) {
    return { error: "Grupo no encontrado" };
  }

  const existingMembership = await getUserMembership(group.id, userId);
  if (existingMembership) {
    return { error: "Ya eres miembro de este grupo" };
  }

  const [existingRequest] = await db
    .select()
    .from(joinRequests)
    .where(
      and(
        eq(joinRequests.groupId, group.id),
        eq(joinRequests.userId, userId),
        eq(joinRequests.status, "pending")
      )
    )
    .limit(1);

  if (existingRequest) {
    return { error: "Ya tienes una solicitud pendiente" };
  }

  await db.insert(joinRequests).values({
    groupId: group.id,
    userId,
  });

  return { success: true, groupName: group.name };
}

export async function approveJoinRequest(
  requestId: string,
  reviewerId: string
) {
  const [request] = await db
    .select()
    .from(joinRequests)
    .where(eq(joinRequests.id, requestId))
    .limit(1);

  if (!request || request.status !== "pending") {
    return { error: "Solicitud no encontrada" };
  }

  const membership = await getUserMembership(request.groupId, reviewerId);
  if (!membership || membership.role === "member") {
    return { error: "No tienes permisos" };
  }

  await db
    .update(joinRequests)
    .set({ status: "approved", reviewedBy: reviewerId, updatedAt: new Date() })
    .where(eq(joinRequests.id, requestId));

  await db.insert(groupMembers).values({
    groupId: request.groupId,
    userId: request.userId,
    role: "member",
  });

  revalidatePath(`/groups/${request.groupId}`);
  return { success: true };
}

export async function rejectJoinRequest(
  requestId: string,
  reviewerId: string
) {
  const [request] = await db
    .select()
    .from(joinRequests)
    .where(eq(joinRequests.id, requestId))
    .limit(1);

  if (!request || request.status !== "pending") {
    return { error: "Solicitud no encontrada" };
  }

  const membership = await getUserMembership(request.groupId, reviewerId);
  if (!membership || membership.role === "member") {
    return { error: "No tienes permisos" };
  }

  await db
    .update(joinRequests)
    .set({ status: "rejected", reviewedBy: reviewerId, updatedAt: new Date() })
    .where(eq(joinRequests.id, requestId));

  return { success: true };
}

export async function removeMember(
  groupId: string,
  memberId: string,
  leaderId: string
) {
  const leaderMembership = await getUserMembership(groupId, leaderId);
  if (!leaderMembership || leaderMembership.role === "member") {
    return { error: "No tienes permisos" };
  }

  if (memberId === leaderId) {
    return { error: "No puedes eliminarte a ti mismo" };
  }

  await db
    .delete(groupMembers)
    .where(
      and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.userId, memberId)
      )
    );

  revalidatePath(`/groups/${groupId}`);
  return { success: true };
}

export async function assignTemporaryLeader(
  groupId: string,
  targetUserId: string,
  leaderId: string
) {
  const leaderMembership = await getUserMembership(groupId, leaderId);
  if (!leaderMembership || leaderMembership.role !== "leader") {
    return { error: "Solo el l\u00edder puede asignar l\u00edderes temporales" };
  }

  await db
    .update(groupMembers)
    .set({ role: "temporary_leader" })
    .where(
      and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.userId, targetUserId)
      )
    );

  revalidatePath(`/groups/${groupId}`);
  return { success: true };
}
