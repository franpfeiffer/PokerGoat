import webpush from "web-push";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { pushSubscriptions, groupMembers } from "@/lib/db/schema";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
}

async function sendToUser(userId: string, payload: PushPayload) {
  const subs = await db
    .select()
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.userId, userId));

  await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify(payload)
        );
      } catch (err: unknown) {
        // Subscription expirada o inválida — eliminarla
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          await db
            .delete(pushSubscriptions)
            .where(eq(pushSubscriptions.id, sub.id));
        }
      }
    })
  );
}

async function sendToGroupMembers(
  groupId: string,
  payload: PushPayload,
  excludeUserId?: string
) {
  const members = await db
    .select({ userId: groupMembers.userId })
    .from(groupMembers)
    .where(eq(groupMembers.groupId, groupId));

  const userIds = members
    .map((m) => m.userId)
    .filter((id) => id !== excludeUserId);

  if (userIds.length === 0) return;

  const subs = await db
    .select()
    .from(pushSubscriptions)
    .where(inArray(pushSubscriptions.userId, userIds));

  await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify(payload)
        );
      } catch (err: unknown) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          await db
            .delete(pushSubscriptions)
            .where(eq(pushSubscriptions.id, sub.id));
        }
      }
    })
  );
}

export const pushNotify = {
  nightScheduled(groupId: string, nightName: string, nightId: string, creatorId: string) {
    return sendToGroupMembers(
      groupId,
      {
        title: "🃏 Nueva noche programada",
        body: nightName,
        url: `/groups/${groupId}/nights/${nightId}`,
        icon: "/icons/casino-chips.png",
      },
      creatorId
    );
  },

  nightStarted(groupId: string, nightName: string, nightId: string) {
    return sendToGroupMembers(groupId, {
      title: "🎰 ¡La noche empezó!",
      body: nightName,
      url: `/groups/${groupId}/nights/${nightId}`,
      icon: "/icons/casino-chips.png",
    });
  },

  resultsPublished(
    groupId: string,
    nightName: string,
    nightId: string,
    winnerName: string
  ) {
    return sendToGroupMembers(groupId, {
      title: "🏆 Resultados publicados",
      body: `${winnerName} ganó en ${nightName}`,
      url: `/groups/${groupId}/nights/${nightId}/results`,
      icon: "/icons/casino-chips.png",
    });
  },

  mvpWon(userId: string, nightName: string, groupId: string, nightId: string) {
    return sendToUser(userId, {
      title: "⭐ ¡Sos el MVP!",
      body: `La mesa te votó MVP en ${nightName}`,
      url: `/groups/${groupId}/nights/${nightId}/results`,
      icon: "/icons/casino-chips.png",
    });
  },
};
