import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { groups } from "./groups";
import { userProfiles } from "./users";

export const activityTypeEnum = pgEnum("activity_type", [
  "night_completed",
  "night_created",
  "member_joined",
]);

export const groupActivity = pgTable("group_activity", {
  id: uuid("id").primaryKey().defaultRandom(),
  groupId: uuid("group_id")
    .notNull()
    .references(() => groups.id, { onDelete: "cascade" }),
  type: activityTypeEnum("type").notNull(),
  // Usuario protagonista del evento (quien ganó, quien se unió, etc.)
  actorId: uuid("actor_id").references(() => userProfiles.id, {
    onDelete: "set null",
  }),
  // ID del recurso relacionado (nightId, memberId, etc.)
  targetId: uuid("target_id"),
  // Datos extra serializados (ej: { profitLoss, nightName })
  metadata: text("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const groupActivityRelations = relations(groupActivity, ({ one }) => ({
  group: one(groups, {
    fields: [groupActivity.groupId],
    references: [groups.id],
  }),
  actor: one(userProfiles, {
    fields: [groupActivity.actorId],
    references: [userProfiles.id],
  }),
}));
