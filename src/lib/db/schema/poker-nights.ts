import {
  pgTable,
  uuid,
  varchar,
  date,
  decimal,
  integer,
  text,
  pgEnum,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { groups } from "./groups";
import { userProfiles } from "./users";
import { pokerNightParticipants } from "./participants";
import { pokerNightResults } from "./results";

export const nightStatusEnum = pgEnum("night_status", [
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
]);

export const pokerNights = pgTable(
  "poker_nights",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    groupId: uuid("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 200 }),
    date: date("date").notNull(),
    status: nightStatusEnum("status").notNull().default("scheduled"),
    chipValue: decimal("chip_value", { precision: 10, scale: 2 }).notNull(),
    buyInAmount: decimal("buy_in_amount", { precision: 10, scale: 2 }).notNull(),
    maxRebuys: integer("max_rebuys"),
    notes: text("notes"),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => userProfiles.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("poker_nights_group_status_idx").on(table.groupId, table.status),
  ]
);

export const pokerNightsRelations = relations(pokerNights, ({ one, many }) => ({
  group: one(groups, {
    fields: [pokerNights.groupId],
    references: [groups.id],
  }),
  creator: one(userProfiles, {
    fields: [pokerNights.createdBy],
    references: [userProfiles.id],
  }),
  participants: many(pokerNightParticipants),
  results: many(pokerNightResults),
}));
