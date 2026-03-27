"use server";

import { eq, and, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { groups, groupMembers, joinRequests } from "@/lib/db/schema";
import { createGroupSchema, updateGroupSchema, joinGroupSchema } from "@/lib/validators/groups";
import { generateInviteCode } from "@/lib/utils/chips";
import {
  getGroupByInviteCode,
  getUserGroups,
  getUserMembership,
} from "@/lib/db/queries/groups";
import { getUserByAuthId } from "@/lib/db/queries/users";
import { insertActivity } from "@/lib/db/queries/activity";
import { auth } from "@/lib/auth/server";
import { revalidateLocalized } from "@/lib/utils/revalidate";
import { revalidateTag } from "next/cache";
import { pushNotify } from "@/lib/push/send";
import { isRateLimited } from "@/lib/utils/rate-limit";

export async function createGroup(userId: string, formData: FormData) {
  const { data: session } = await auth!.getSession();
  if (session?.user?.email !== process.env.ADMIN_EMAIL) {
    return { error: "No tienes permisos para crear grupos" };
  }

  const parsed = createGroupSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    defaultBuyIn: formData.get("defaultBuyIn"),
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
      currency: "ARS",
      inviteCode,
      createdBy: userId,
    })
    .returning();

  await db.insert(groupMembers).values({
    groupId: group.id,
    userId,
    role: "leader",
  });

  revalidateLocalized("/dashboard");
  revalidateLocalized("/groups");
  return { groupId: group.id };
}

export async function getMyGroups(authUserId: string) {
  const profile = await getUserByAuthId(authUserId);
  if (!profile) return [];
  return getUserGroups(profile.id);
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

  await db.update(groups).set(updateData).where(eq(groups.id, groupId));

  revalidateLocalized(`/groups/${groupId}`);
  return { success: true };
}

export async function requestJoinGroup(userId: string, formData: FormData) {
  // Rate limit: max 5 join requests per user per 10 minutes
  if (isRateLimited(`join-request:${userId}`, 5, 10 * 60_000)) {
    return { error: "Demasiados intentos. Probá de nuevo en unos minutos." };
  }

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

  // Notify group leaders
  const leaders = await db
    .select({ userId: groupMembers.userId })
    .from(groupMembers)
    .where(
      and(
        eq(groupMembers.groupId, group.id),
        inArray(groupMembers.role, ["leader", "temporary_leader"])
      )
    );
  await Promise.allSettled(
    leaders.map((l) =>
      pushNotify.joinRequest(l.userId, group.id, group.name)
    )
  );

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

  await insertActivity({
    groupId: request.groupId,
    type: "member_joined",
    actorId: request.userId,
  }).catch(() => {});

  // Notify the user their request was approved
  await pushNotify.joinApproved(request.userId, request.groupId).catch(() => {});

  revalidateLocalized(`/groups/${request.groupId}`);
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

  // Notify the user their request was rejected
  await pushNotify.joinRejected(request.userId, request.groupId).catch(() => {});

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

  revalidateLocalized(`/groups/${groupId}`);
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

  revalidateLocalized(`/groups/${groupId}`);
  return { success: true };
}

export async function revokeTemporaryLeader(
  groupId: string,
  targetUserId: string,
  leaderId: string
) {
  const leaderMembership = await getUserMembership(groupId, leaderId);
  if (!leaderMembership || leaderMembership.role !== "leader") {
    return { error: "Solo el líder puede remover líderes temporales" };
  }

  await db
    .update(groupMembers)
    .set({ role: "member" })
    .where(
      and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.userId, targetUserId)
      )
    );

  revalidateLocalized(`/groups/${groupId}`);
  return { success: true };
}
