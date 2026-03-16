import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { groupMembers } from "./group-members";
import { pokerNightParticipants } from "./participants";
import { pokerNightResults } from "./results";
import { joinRequests } from "./join-requests";

export const userProfiles = pgTable("user_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  authUserId: text("auth_user_id").notNull().unique(),
  displayName: varchar("display_name", { length: 100 }).notNull(),
  avatarUrl: text("avatar_url"),
  locale: varchar("locale", { length: 5 }).notNull().default("es"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const userProfilesRelations = relations(userProfiles, ({ many }) => ({
  groupMemberships: many(groupMembers),
  participations: many(pokerNightParticipants),
  results: many(pokerNightResults),
  joinRequests: many(joinRequests),
}));
