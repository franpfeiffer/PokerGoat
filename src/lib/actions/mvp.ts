"use server";

import { eq, and, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { mvpVotes, pokerNights, pokerNightParticipants } from "@/lib/db/schema";
import { revalidateTag } from "next/cache";
import { pushNotify } from "@/lib/push/send";

export async function voteForMvp(
  nightId: string,
  voterId: string,
  candidateId: string
) {
  // Can't vote for yourself
  if (voterId === candidateId) {
    return { error: "You can't vote for yourself" };
  }

  // Verify night is completed
  const [night] = await db
    .select()
    .from(pokerNights)
    .where(eq(pokerNights.id, nightId))
    .limit(1);

  if (!night || night.status !== "completed") {
    return { error: "Night is not completed" };
  }

  // Verify both voter and candidate were participants in one query, and fetch existing vote in parallel
  const [participants, existingVoteResult] = await Promise.all([
    db
      .select({ userId: pokerNightParticipants.userId })
      .from(pokerNightParticipants)
      .where(
        and(
          eq(pokerNightParticipants.nightId, nightId),
          inArray(pokerNightParticipants.userId, [voterId, candidateId])
        )
      ),
    db
      .select()
      .from(mvpVotes)
      .where(and(eq(mvpVotes.nightId, nightId), eq(mvpVotes.voterId, voterId)))
      .limit(1),
  ]);

  const participantUserIds = new Set(participants.map((p) => p.userId));
  if (!participantUserIds.has(voterId)) {
    return { error: "You were not a participant" };
  }
  if (!participantUserIds.has(candidateId)) {
    return { error: "Candidate was not a participant" };
  }

  const [existingVote] = existingVoteResult;

  const isNewVote = !existingVote;
  const previousCandidateId = existingVote?.candidateId;

  if (existingVote) {
    await db
      .update(mvpVotes)
      .set({ candidateId, createdAt: new Date() })
      .where(eq(mvpVotes.id, existingVote.id));
  } else {
    await db.insert(mvpVotes).values({ nightId, voterId, candidateId });
  }

  // Notificar al candidato si recibió un voto nuevo (o cambió a él)
  const candidateGotNewVote = isNewVote || previousCandidateId !== candidateId;
  if (candidateGotNewVote) {
    pushNotify
      .mvpWon(
        candidateId,
        night.name ?? "Noche de poker",
        night.groupId,
        nightId
      )
      .catch(() => {});
  }

  revalidateTag(`night-${nightId}`, "max");
  return { success: true };
}
