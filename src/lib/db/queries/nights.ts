import { eq, and, desc } from "drizzle-orm";
import { db } from "..";
import {
  pokerNights,
  pokerNightParticipants,
  userProfiles,
} from "../schema";

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
