import { eq, and, desc } from "drizzle-orm";
import { db } from "..";
import { groups, groupMembers, userProfiles } from "../schema";

export async function getUserGroups(userId: string) {
  return db
    .select({
      id: groups.id,
      name: groups.name,
      description: groups.description,
      currency: groups.currency,
      defaultBuyIn: groups.defaultBuyIn,
      defaultChipValue: groups.defaultChipValue,
      inviteCode: groups.inviteCode,
      role: groupMembers.role,
      joinedAt: groupMembers.joinedAt,
      createdAt: groups.createdAt,
    })
    .from(groupMembers)
    .innerJoin(groups, eq(groupMembers.groupId, groups.id))
    .where(eq(groupMembers.userId, userId))
    .orderBy(desc(groups.createdAt));
}

export async function getGroupById(groupId: string) {
  const [group] = await db
    .select()
    .from(groups)
    .where(eq(groups.id, groupId))
    .limit(1);
  return group ?? null;
}

export async function getGroupByInviteCode(inviteCode: string) {
  const [group] = await db
    .select()
    .from(groups)
    .where(eq(groups.inviteCode, inviteCode))
    .limit(1);
  return group ?? null;
}

export async function getGroupMembers(groupId: string) {
  return db
    .select({
      id: groupMembers.id,
      userId: groupMembers.userId,
      role: groupMembers.role,
      joinedAt: groupMembers.joinedAt,
      displayName: userProfiles.displayName,
      avatarUrl: userProfiles.avatarUrl,
    })
    .from(groupMembers)
    .innerJoin(userProfiles, eq(groupMembers.userId, userProfiles.id))
    .where(eq(groupMembers.groupId, groupId))
    .orderBy(groupMembers.joinedAt);
}

export async function getUserMembership(groupId: string, userId: string) {
  const [membership] = await db
    .select()
    .from(groupMembers)
    .where(
      and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.userId, userId)
      )
    )
    .limit(1);
  return membership ?? null;
}
