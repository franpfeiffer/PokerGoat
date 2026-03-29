import { unstable_cache } from "next/cache";
import { eq, sql, gte, and, asc, desc } from "drizzle-orm";
import { db } from "..";
import { userProfiles, pokerNightResults, pokerNights, groupMembers, mvpVotes } from "../schema";

const CACHE_TTL = 60;

export async function getUserByAuthId(authUserId: string) {
  const [user] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.authUserId, authUserId))
    .limit(1);
  return user ?? null;
}

export async function getUserById(id: string) {
  const getCached = unstable_cache(
    async () => {
      const [user] = await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.id, id))
        .limit(1);
      return user ?? null;
    },
    [`user-profile-${id}`],
    { revalidate: CACHE_TTL, tags: [`user-${id}`] }
  );
  return getCached();
}

export async function createUserProfile(data: {
  authUserId: string;
  displayName: string;
  avatarUrl?: string;
  locale?: string;
}) {
  const [user] = await db.insert(userProfiles).values(data).returning();
  return user;
}

export async function getUserStats(userId: string) {
  const getCached = unstable_cache(
    async () => {
      const [stats] = await db
        .select({
          nightsPlayed: sql<number>`count(${pokerNightResults.id})::int`,
          totalProfit: sql<number>`coalesce(sum(${pokerNightResults.profitLoss}), 0)::numeric`,
          wins: sql<number>`count(case when ${pokerNightResults.profitLoss} > 0 then 1 end)::int`,
        })
        .from(pokerNightResults)
        .where(eq(pokerNightResults.userId, userId));

      const nightsPlayed = stats?.nightsPlayed ?? 0;
      const wins = stats?.wins ?? 0;

      return {
        nightsPlayed,
        totalProfit: Number(stats?.totalProfit ?? 0),
        winRate: nightsPlayed > 0 ? wins / nightsPlayed : 0,
      };
    },
    [`user-stats-${userId}`],
    { revalidate: CACHE_TTL, tags: [`user-${userId}`] }
  );

  return getCached();
}

export async function getDashboardStats(userId: string) {
  const getCached = unstable_cache(
    async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const dateStr = thirtyDaysAgo.toISOString().split("T")[0];

      const [allTime] = await db
        .select({
          nightsPlayed: sql<number>`count(${pokerNightResults.id})::int`,
          totalProfit: sql<number>`coalesce(sum(${pokerNightResults.profitLoss}), 0)::numeric`,
          wins: sql<number>`count(case when ${pokerNightResults.profitLoss} > 0 then 1 end)::int`,
        })
        .from(pokerNightResults)
        .where(eq(pokerNightResults.userId, userId));

      const [recent] = await db
        .select({
          nightsPlayed: sql<number>`count(${pokerNightResults.id})::int`,
          totalProfit: sql<number>`coalesce(sum(${pokerNightResults.profitLoss}), 0)::numeric`,
          wins: sql<number>`count(case when ${pokerNightResults.profitLoss} > 0 then 1 end)::int`,
        })
        .from(pokerNightResults)
        .innerJoin(pokerNights, eq(pokerNightResults.nightId, pokerNights.id))
        .where(
          and(
            eq(pokerNightResults.userId, userId),
            gte(pokerNights.date, dateStr)
          )
        );

      const nightsPlayed = allTime?.nightsPlayed ?? 0;
      const wins = allTime?.wins ?? 0;
      const recentNights = recent?.nightsPlayed ?? 0;
      const recentWins = recent?.wins ?? 0;

      return {
        allTime: {
          nightsPlayed,
          totalProfit: Number(allTime?.totalProfit ?? 0),
          winRate: nightsPlayed > 0 ? wins / nightsPlayed : 0,
        },
        last30Days: {
          nightsPlayed: recentNights,
          totalProfit: Number(recent?.totalProfit ?? 0),
          winRate: recentNights > 0 ? recentWins / recentNights : 0,
        },
      };
    },
    [`dashboard-stats-${userId}`],
    { revalidate: CACHE_TTL, tags: [`user-${userId}`] }
  );

  return getCached();
}

export async function getUserStreak(userId: string) {
  const getCached = unstable_cache(
    async () => {
      const rows = await db
        .select({
          profitLoss: pokerNightResults.profitLoss,
        })
        .from(pokerNightResults)
        .innerJoin(pokerNights, eq(pokerNightResults.nightId, pokerNights.id))
        .where(eq(pokerNightResults.userId, userId))
        .orderBy(asc(pokerNights.date));

      if (rows.length === 0) return { type: "none" as const, count: 0 };

      const results = rows.map((r) => Number(r.profitLoss) > 0);
      const last = results[results.length - 1];
      let count = 0;
      for (let i = results.length - 1; i >= 0; i--) {
        if (results[i] === last) count++;
        else break;
      }

      return {
        type: last ? ("winning" as const) : ("losing" as const),
        count,
      };
    },
    [`user-streak-${userId}`],
    { revalidate: CACHE_TTL, tags: [`user-${userId}`] }
  );

  return getCached();
}

export async function getUserProfitHistory(userId: string) {
  const getCached = unstable_cache(
    async () => {
      const rows = await db
        .select({
          date: pokerNights.date,
          profitLoss: pokerNightResults.profitLoss,
        })
        .from(pokerNightResults)
        .innerJoin(pokerNights, eq(pokerNightResults.nightId, pokerNights.id))
        .where(eq(pokerNightResults.userId, userId))
        .orderBy(asc(pokerNights.date));

      let cumulative = 0;
      return rows.map((row) => {
        const pl = Number(row.profitLoss);
        cumulative += pl;
        return {
          date: row.date,
          profitLoss: pl,
          cumulative: Number(cumulative.toFixed(2)),
        };
      });
    },
    [`user-profit-history-${userId}`],
    { revalidate: CACHE_TTL, tags: [`user-${userId}`] }
  );

  return getCached();
}

export interface GroupComparisonStats {
  groupName: string;
  groupId: string;
  userRank: number;
  totalPlayers: number;
  userWinRate: number;
  avgWinRate: number;
  userRoi: number;
  avgRoi: number;
  userAvgProfit: number;
  avgGroupProfit: number;
}

export async function getUserGroupComparison(userId: string): Promise<GroupComparisonStats | null> {
  const getCached = unstable_cache(
    async () => {
      const { groups } = await import("../schema");

      // Find the group where the user has played the most nights (single query)
      const nightsByGroup = await db
        .select({
          groupId: pokerNights.groupId,
          nightCount: sql<number>`count(${pokerNightResults.id})::int`,
        })
        .from(pokerNightResults)
        .innerJoin(pokerNights, eq(pokerNightResults.nightId, pokerNights.id))
        .where(eq(pokerNightResults.userId, userId))
        .groupBy(pokerNights.groupId)
        .orderBy(desc(sql`count(${pokerNightResults.id})`))
        .limit(1);

      if (nightsByGroup.length === 0) return null;

      const groupId = nightsByGroup[0].groupId;

      // Fetch group name and all player stats in parallel
      const [groupResult, rows] = await Promise.all([
        db
          .select({ name: groups.name })
          .from(groups)
          .where(eq(groups.id, groupId))
          .limit(1),
        db
          .select({
            userId: pokerNightResults.userId,
            nightsPlayed: sql<number>`count(${pokerNightResults.id})::int`,
            totalProfit: sql<number>`sum(${pokerNightResults.profitLoss})::numeric`,
            totalInvested: sql<number>`sum(${pokerNightResults.totalInvested})::numeric`,
            wins: sql<number>`count(case when ${pokerNightResults.profitLoss} > 0 then 1 end)::int`,
          })
          .from(pokerNightResults)
          .innerJoin(pokerNights, eq(pokerNightResults.nightId, pokerNights.id))
          .where(eq(pokerNights.groupId, groupId))
          .groupBy(pokerNightResults.userId)
          .orderBy(sql`sum(${pokerNightResults.profitLoss}) desc`),
      ]);

      const [group] = groupResult;
      if (!group) return null;

      if (rows.length < 2) return null;

      const playerStats = rows.map((r) => {
        const nights = Number(r.nightsPlayed);
        const profit = Number(r.totalProfit);
        const invested = Number(r.totalInvested);
        const wins = Number(r.wins);
        return {
          userId: r.userId,
          winRate: nights > 0 ? wins / nights : 0,
          roi: invested > 0 ? (profit / invested) * 100 : 0,
          avgProfit: nights > 0 ? profit / nights : 0,
        };
      });

      const userStat = playerStats.find((p) => p.userId === userId);
      if (!userStat) return null;

      const userRank = rows.findIndex((r) => r.userId === userId) + 1;
      const totalPlayers = rows.length;

      const avgWinRate = playerStats.reduce((s, p) => s + p.winRate, 0) / totalPlayers;
      const avgRoi = playerStats.reduce((s, p) => s + p.roi, 0) / totalPlayers;
      const avgGroupProfit = playerStats.reduce((s, p) => s + p.avgProfit, 0) / totalPlayers;

      return {
        groupName: group.name,
        groupId,
        userRank,
        totalPlayers,
        userWinRate: userStat.winRate,
        avgWinRate,
        userRoi: userStat.roi,
        avgRoi,
        userAvgProfit: userStat.avgProfit,
        avgGroupProfit,
      };
    },
    [`user-group-comparison-${userId}`],
    { revalidate: CACHE_TTL, tags: [`user-${userId}`] }
  );

  return getCached();
}

export async function getUserAchievementData(userId: string) {
  const getCached = unstable_cache(
    async () => {
      const [[statsRow], [mvpRow], nightRows] = await Promise.all([
        db
          .select({
            nightsPlayed: sql<number>`count(${pokerNightResults.id})::int`,
            totalProfit: sql<number>`coalesce(sum(${pokerNightResults.profitLoss}), 0)::numeric`,
            wins: sql<number>`count(case when ${pokerNightResults.profitLoss} > 0 then 1 end)::int`,
            biggestWin: sql<number>`coalesce(max(${pokerNightResults.profitLoss}), 0)::numeric`,
            lastPlaceCount: sql<number>`count(case when ${pokerNightResults.rank} = (
              select count(*) from ${pokerNightResults} r2 where r2.night_id = ${pokerNightResults.nightId}
            ) then 1 end)::int`,
            brokeCount: sql<number>`count(case when ${pokerNightResults.totalCashout}::numeric = 0 then 1 end)::int`,
            rebuyNightsCount: sql<number>`count(case when ${pokerNightResults.totalInvested}::numeric > (
              select p.buy_in_amount::numeric from ${pokerNights} p where p.id = ${pokerNightResults.nightId}
            ) then 1 end)::int`,
            totalRebuysSpent: sql<number>`coalesce(sum(
              greatest(${pokerNightResults.totalInvested}::numeric - (
                select p.buy_in_amount::numeric from ${pokerNights} p where p.id = ${pokerNightResults.nightId}
              ), 0)
            ), 0)::numeric`,
          })
          .from(pokerNightResults)
          .where(eq(pokerNightResults.userId, userId)),
        db
          .select({
            mvpCount: sql<number>`count(*)::int`,
          })
          .from(mvpVotes)
          .where(eq(mvpVotes.candidateId, userId)),
        db
          .select({
            rank: pokerNightResults.rank,
            profitLoss: pokerNightResults.profitLoss,
            nightId: pokerNightResults.nightId,
            totalInvested: pokerNightResults.totalInvested,
            buyInAmount: sql<number>`(select p.buy_in_amount::numeric from ${pokerNights} p where p.id = ${pokerNightResults.nightId})`,
          })
          .from(pokerNightResults)
          .where(eq(pokerNightResults.userId, userId))
          .orderBy(asc(pokerNightResults.nightId)),
      ]);

      const nightsPlayed = statsRow?.nightsPlayed ?? 0;
      const wins = statsRow?.wins ?? 0;

      // Calculate first place streak, redemption, longest win streak, and banco central from ordered night results
      let firstPlaceStreak = 0;
      let currentFirstStreak = 0;
      let longestWinStreak = 0;
      let currentWinStreak = 0;
      let hadRedemption = false;
      let prevWasWorstNight = false;
      let maxConsecutiveRebuyNights = 0;
      const worstProfit = nightRows.length > 0
        ? Math.min(...nightRows.map((r) => Number(r.profitLoss)))
        : 0;

      // Per-night rebuy counts for banco_central detection
      const rebuyCountPerNight = nightRows.map((r) => {
        const invested = Number(r.totalInvested);
        const buyIn = Number(r.buyInAmount);
        if (buyIn <= 0) return 0;
        return Math.max(0, Math.round((invested - buyIn) / buyIn));
      });

      // Sliding window: max rebuys in any 2 consecutive nights
      for (let i = 0; i < rebuyCountPerNight.length - 1; i++) {
        const sum = rebuyCountPerNight[i] + rebuyCountPerNight[i + 1];
        if (sum > maxConsecutiveRebuyNights) maxConsecutiveRebuyNights = sum;
      }

      for (const row of nightRows) {
        const pl = Number(row.profitLoss);
        const isFirst = row.rank === 1;

        if (isFirst) {
          currentFirstStreak++;
          if (currentFirstStreak > firstPlaceStreak) firstPlaceStreak = currentFirstStreak;
        } else {
          currentFirstStreak = 0;
        }

        if (pl > 0) {
          currentWinStreak++;
          if (currentWinStreak > longestWinStreak) longestWinStreak = currentWinStreak;
        } else {
          currentWinStreak = 0;
        }

        if (prevWasWorstNight && pl > 0) hadRedemption = true;
        prevWasWorstNight = pl === worstProfit && worstProfit < 0;
      }

      return {
        nightsPlayed,
        totalProfit: Number(statsRow?.totalProfit ?? 0),
        winRate: nightsPlayed > 0 ? wins / nightsPlayed : 0,
        biggestWin: Number(statsRow?.biggestWin ?? 0),
        mvpCount: mvpRow?.mvpCount ?? 0,
        lastPlaceCount: Number(statsRow?.lastPlaceCount ?? 0),
        brokeCount: Number(statsRow?.brokeCount ?? 0),
        rebuyNightsCount: Number(statsRow?.rebuyNightsCount ?? 0),
        totalRebuysSpent: Number(statsRow?.totalRebuysSpent ?? 0),
        firstPlaceStreak,
        hadRedemption,
        longestWinStreak,
        maxConsecutiveRebuyNights,
      };
    },
    [`user-achievement-data-${userId}`],
    { revalidate: CACHE_TTL, tags: [`user-${userId}`] }
  );

  return getCached();
}

export async function getUserPersonalRecords(userId: string) {
  const getCached = unstable_cache(
    async () => {
      const [[statsRow], streakRows] = await Promise.all([
        db
          .select({
            biggestWin: sql<number>`coalesce(max(${pokerNightResults.profitLoss}), 0)::numeric`,
            worstNight: sql<number>`coalesce(min(${pokerNightResults.profitLoss}), 0)::numeric`,
            biggestWinNightId: sql<string>`(
              select night_id from ${pokerNightResults} r2
              where r2.user_id = ${userId}
              order by r2.profit_loss desc limit 1
            )`,
            worstNightId: sql<string>`(
              select night_id from ${pokerNightResults} r2
              where r2.user_id = ${userId}
              order by r2.profit_loss asc limit 1
            )`,
            biggestWinDate: sql<string>`(
              select pn.date from ${pokerNightResults} r2
              inner join ${pokerNights} pn on pn.id = r2.night_id
              where r2.user_id = ${userId}
              order by r2.profit_loss desc limit 1
            )`,
            worstNightDate: sql<string>`(
              select pn.date from ${pokerNightResults} r2
              inner join ${pokerNights} pn on pn.id = r2.night_id
              where r2.user_id = ${userId}
              order by r2.profit_loss asc limit 1
            )`,
          })
          .from(pokerNightResults)
          .where(eq(pokerNightResults.userId, userId)),
        db
          .select({ profitLoss: pokerNightResults.profitLoss })
          .from(pokerNightResults)
          .innerJoin(pokerNights, eq(pokerNightResults.nightId, pokerNights.id))
          .where(eq(pokerNightResults.userId, userId))
          .orderBy(asc(pokerNights.date)),
      ]);

      // Calculate longest winning streak
      let longestStreak = 0;
      let currentStreak = 0;
      for (const row of streakRows) {
        if (Number(row.profitLoss) > 0) {
          currentStreak++;
          if (currentStreak > longestStreak) longestStreak = currentStreak;
        } else {
          currentStreak = 0;
        }
      }

      return {
        biggestWin: Number(statsRow?.biggestWin ?? 0),
        worstNight: Number(statsRow?.worstNight ?? 0),
        biggestWinNightId: statsRow?.biggestWinNightId ?? null,
        worstNightId: statsRow?.worstNightId ?? null,
        biggestWinDate: statsRow?.biggestWinDate ?? null,
        worstNightDate: statsRow?.worstNightDate ?? null,
        longestWinStreak: longestStreak,
      };
    },
    [`user-personal-records-${userId}`],
    { revalidate: CACHE_TTL, tags: [`user-${userId}`] }
  );
  return getCached();
}

export async function updateUserProfile(
  id: string,
  data: Partial<{
    displayName: string;
    avatarUrl: string;
    locale: string;
    bankAlias: string | null;
  }>
) {
  const [user] = await db
    .update(userProfiles)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(userProfiles.id, id))
    .returning();
  return user;
}
