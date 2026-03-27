import { unstable_cache } from "next/cache";
import { eq, sql } from "drizzle-orm";
import { db } from "..";
import { mvpVotes, userProfiles, pokerNights } from "../schema";

export interface MvpLeaderboardEntry {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  mvpCount: number;
}

export async function getGroupMvpLeaderboard(groupId: string): Promise<MvpLeaderboardEntry[]> {
  const getCached = unstable_cache(
    async () => {
      const rows = await db
        .select({
          userId: mvpVotes.candidateId,
          displayName: userProfiles.displayName,
          avatarUrl: userProfiles.avatarUrl,
          mvpCount: sql<number>`count(*)::int`,
        })
        .from(mvpVotes)
        .innerJoin(pokerNights, eq(mvpVotes.nightId, pokerNights.id))
        .innerJoin(userProfiles, eq(mvpVotes.candidateId, userProfiles.id))
        .where(eq(pokerNights.groupId, groupId))
        .groupBy(mvpVotes.candidateId, userProfiles.displayName, userProfiles.avatarUrl)
        .orderBy(sql`count(*) desc`);

      return rows.map((r) => ({
        userId: r.userId,
        displayName: r.displayName,
        avatarUrl: r.avatarUrl,
        mvpCount: r.mvpCount,
      }));
    },
    [`group-mvp-leaderboard-${groupId}`],
    { revalidate: 30, tags: [`group-${groupId}`] }
  );

  return getCached();
}

export interface MvpCandidate {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  votes: number;
}

export interface MvpData {
  candidates: MvpCandidate[];
  currentVote: string | null;
  totalVotes: number;
}

export async function getNightMvpVotes(
  nightId: string,
  currentUserId?: string
): Promise<MvpData> {
  const getCached = unstable_cache(
    async () => {
      const rows = await db
        .select({
          candidateId: mvpVotes.candidateId,
          displayName: userProfiles.displayName,
          avatarUrl: userProfiles.avatarUrl,
          votes: sql<number>`count(*)::int`,
        })
        .from(mvpVotes)
        .innerJoin(userProfiles, eq(mvpVotes.candidateId, userProfiles.id))
        .where(eq(mvpVotes.nightId, nightId))
        .groupBy(mvpVotes.candidateId, userProfiles.displayName, userProfiles.avatarUrl)
        .orderBy(sql`count(*) desc`);

      const candidates: MvpCandidate[] = rows.map((r) => ({
        userId: r.candidateId,
        displayName: r.displayName,
        avatarUrl: r.avatarUrl,
        votes: r.votes,
      }));

      const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0);

      return { candidates, totalVotes };
    },
    [`night-mvp-${nightId}`],
    { revalidate: 10, tags: [`night-${nightId}`] }
  );

  const { candidates, totalVotes } = await getCached();

  // Current user's vote - not cached since it's per-user
  let currentVote: string | null = null;
  if (currentUserId) {
    const [vote] = await db
      .select({ candidateId: mvpVotes.candidateId })
      .from(mvpVotes)
      .where(
        sql`${mvpVotes.nightId} = ${nightId} AND ${mvpVotes.voterId} = ${currentUserId}`
      )
      .limit(1);
    currentVote = vote?.candidateId ?? null;
  }

  return { candidates, currentVote, totalVotes };
}
