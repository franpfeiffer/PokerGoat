import {
  pgTable,
  uuid,
  varchar,
  text,
  decimal,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { userProfiles } from "./users";
import { groupMembers } from "./group-members";
import { pokerNights } from "./poker-nights";
import { joinRequests } from "./join-requests";

export const groups = pgTable("groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 150 }).notNull(),
  description: text("description"),
  inviteCode: varchar("invite_code", { length: 20 }).notNull().unique(),
  defaultChipValue: decimal("default_chip_value", {
    precision: 10,
    scale: 2,
  })
    .notNull()
    .default("0.10"),
  defaultBuyIn: decimal("default_buy_in", { precision: 10, scale: 2 })
    .notNull()
    .default("10.00"),
  currency: varchar("currency", { length: 3 }).notNull().default("EUR"),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => userProfiles.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const groupsRelations = relations(groups, ({ one, many }) => ({
  creator: one(userProfiles, {
    fields: [groups.createdBy],
    references: [userProfiles.id],
  }),
  members: many(groupMembers),
  pokerNights: many(pokerNights),
  joinRequests: many(joinRequests),
}));
