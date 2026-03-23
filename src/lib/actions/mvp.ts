"use server";

import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { mvpVotes, pokerNights, pokerNightParticipants } from "@/lib/db/schema";
import { revalidateTag } from "next/cache";

export async function voteForMvp(
  nightId: string,
  voterId: string,
  candidateId: string
) {
  // Verify night is completed
  const [night] = await db
    .select()
    .from(pokerNights)
    .where(eq(pokerNights.id, nightId))
    .limit(1);

  if (!night || night.status !== "completed") {
    return { error: "Night is not completed" };
  }

  // Verify voter was a participant
  const [voterParticipant] = await db
    .select()
    .from(pokerNightParticipants)
    .where(
      and(
        eq(pokerNightParticipants.nightId, nightId),
        eq(pokerNightParticipants.userId, voterId)
      )
    )
    .limit(1);

  if (!voterParticipant) {
    return { error: "You were not a participant" };
  }

  // Verify candidate was a participant
  const [candidateParticipant] = await db
    .select()
    .from(pokerNightParticipants)
    .where(
      and(
        eq(pokerNightParticipants.nightId, nightId),
        eq(pokerNightParticipants.userId, candidateId)
      )
    )
    .limit(1);

  if (!candidateParticipant) {
    return { error: "Candidate was not a participant" };
  }

  // Can't vote for yourself
  if (voterId === candidateId) {
    return { error: "You can't vote for yourself" };
  }

  // Upsert vote
  const [existingVote] = await db
    .select()
    .from(mvpVotes)
    .where(
      and(eq(mvpVotes.nightId, nightId), eq(mvpVotes.voterId, voterId))
    )
    .limit(1);

  if (existingVote) {
    await db
      .update(mvpVotes)
      .set({ candidateId, createdAt: new Date() })
      .where(eq(mvpVotes.id, existingVote.id));
  } else {
    await db.insert(mvpVotes).values({ nightId, voterId, candidateId });
  }

  revalidateTag(`night-${nightId}`, "max");
  return { success: true };
}
