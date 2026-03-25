import { eq, and, desc, inArray } from "drizzle-orm";
import { db } from "..";
import {
  pokerNights,
  pokerNightParticipants,
  userProfiles,
  groupMembers,
  groups,
} from "../schema";

export async function getUpcomingNightsForUser(userId: string) {
  return db
    .select({
      id: pokerNights.id,
      name: pokerNights.name,
      date: pokerNights.date,
      status: pokerNights.status,
      groupId: pokerNights.groupId,
      groupName: groups.name,
    })
    .from(groupMembers)
    .innerJoin(groups, eq(groupMembers.groupId, groups.id))
    .innerJoin(
      pokerNights,
      and(
        eq(pokerNights.groupId, groups.id),
        inArray(pokerNights.status, ["scheduled", "in_progress"])
      )
    )
    .where(eq(groupMembers.userId, userId))
    .orderBy(pokerNights.date);
}

export async function getGroupNights(groupId: string) {
  return db
    .select()
    .from(pokerNights)
    .where(eq(pokerNights.groupId, groupId))
    .orderBy(desc(pokerNights.date));
}

export async function getNightById(nightId: string) {
  const [night] = await db
    .select()
    .from(pokerNights)
    .where(eq(pokerNights.id, nightId))
    .limit(1);
  return night ?? null;
}

export async function getNightParticipants(nightId: string) {
  return db
    .select({
      id: pokerNightParticipants.id,
      nightId: pokerNightParticipants.nightId,
      userId: pokerNightParticipants.userId,
      buyInCount: pokerNightParticipants.buyInCount,
      rebuyTotal: pokerNightParticipants.rebuyTotal,
      chipsBlackEnd: pokerNightParticipants.chipsBlackEnd,
      chipsWhiteEnd: pokerNightParticipants.chipsWhiteEnd,
      chipsRedEnd: pokerNightParticipants.chipsRedEnd,
      chipsGreenEnd: pokerNightParticipants.chipsGreenEnd,
      chipsBlueEnd: pokerNightParticipants.chipsBlueEnd,
      totalChipsEnd: pokerNightParticipants.totalChipsEnd,
      displayName: userProfiles.displayName,
      avatarUrl: userProfiles.avatarUrl,
    })
    .from(pokerNightParticipants)
    .innerJoin(
      userProfiles,
      eq(pokerNightParticipants.userId, userProfiles.id)
    )
    .where(eq(pokerNightParticipants.nightId, nightId))
    .orderBy(pokerNightParticipants.createdAt);
}

export async function getParticipant(nightId: string, userId: string) {
  const [participant] = await db
    .select()
    .from(pokerNightParticipants)
    .where(
      and(
        eq(pokerNightParticipants.nightId, nightId),
        eq(pokerNightParticipants.userId, userId)
      )
    )
    .limit(1);
  return participant ?? null;
}
