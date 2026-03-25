import { unstable_cache } from "next/cache";
import { eq, desc } from "drizzle-orm";
import { db } from "..";
import { groupActivity, userProfiles } from "../schema";

const CACHE_TTL = 30;

export interface ActivityItem {
  id: string;
  type: "night_completed" | "night_created" | "member_joined";
  actorId: string | null;
  actorName: string | null;
  actorAvatar: string | null;
  targetId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}

export async function getGroupActivity(
  groupId: string,
  limit = 10
): Promise<ActivityItem[]> {
  const getCached = unstable_cache(
    async () => {
      const rows = await db
        .select({
          id: groupActivity.id,
          type: groupActivity.type,
          actorId: groupActivity.actorId,
          actorName: userProfiles.displayName,
          actorAvatar: userProfiles.avatarUrl,
          targetId: groupActivity.targetId,
          metadata: groupActivity.metadata,
          createdAt: groupActivity.createdAt,
        })
        .from(groupActivity)
        .leftJoin(userProfiles, eq(groupActivity.actorId, userProfiles.id))
        .where(eq(groupActivity.groupId, groupId))
        .orderBy(desc(groupActivity.createdAt))
        .limit(limit);

      return rows.map((r) => ({
        ...r,
        metadata: r.metadata ? JSON.parse(r.metadata) : null,
      }));
    },
    [`group-activity-${groupId}`],
    { revalidate: CACHE_TTL, tags: [`group-${groupId}-activity`] }
  );

  return getCached();
}

export async function insertActivity(data: {
  groupId: string;
  type: "night_completed" | "night_created" | "member_joined";
  actorId?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}) {
  await db.insert(groupActivity).values({
    groupId: data.groupId,
    type: data.type,
    actorId: data.actorId ?? null,
    targetId: data.targetId ?? null,
    metadata: data.metadata ? JSON.stringify(data.metadata) : null,
  });
}
