import {
  pgTable,
  uuid,
  text,
  pgEnum,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { groups } from "./groups";
import { userProfiles } from "./users";

export const requestStatusEnum = pgEnum("request_status", [
  "pending",
  "approved",
  "rejected",
]);

export const joinRequests = pgTable(
  "join_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    groupId: uuid("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => userProfiles.id),
    status: requestStatusEnum("status").notNull().default("pending"),
    message: text("message"),
    reviewedBy: uuid("reviewed_by").references(() => userProfiles.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [unique("join_requests_group_user").on(table.groupId, table.userId)]
);

export const joinRequestsRelations = relations(joinRequests, ({ one }) => ({
  group: one(groups, {
    fields: [joinRequests.groupId],
    references: [groups.id],
  }),
  user: one(userProfiles, {
    fields: [joinRequests.userId],
    references: [userProfiles.id],
  }),
  reviewer: one(userProfiles, {
    fields: [joinRequests.reviewedBy],
    references: [userProfiles.id],
  }),
}));
