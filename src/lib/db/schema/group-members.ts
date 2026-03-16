import {
  pgTable,
  uuid,
  pgEnum,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { userProfiles } from "./users";
import { groups } from "./groups";

export const memberRoleEnum = pgEnum("member_role", [
  "leader",
  "temporary_leader",
  "member",
]);

export const groupMembers = pgTable(
  "group_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    groupId: uuid("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => userProfiles.id, { onDelete: "cascade" }),
    role: memberRoleEnum("role").notNull().default("member"),
    joinedAt: timestamp("joined_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [unique("group_members_group_user").on(table.groupId, table.userId)]
);

export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
  group: one(groups, {
    fields: [groupMembers.groupId],
    references: [groups.id],
  }),
  user: one(userProfiles, {
    fields: [groupMembers.userId],
    references: [userProfiles.id],
  }),
}));
