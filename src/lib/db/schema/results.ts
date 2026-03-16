import {
  pgTable,
  uuid,
  decimal,
  integer,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { pokerNights } from "./poker-nights";
import { userProfiles } from "./users";
import { pokerNightParticipants } from "./participants";

export const pokerNightResults = pgTable(
  "poker_night_results",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    nightId: uuid("night_id")
      .notNull()
      .references(() => pokerNights.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => userProfiles.id),
    participantId: uuid("participant_id")
      .notNull()
      .references(() => pokerNightParticipants.id),
    totalInvested: decimal("total_invested", { precision: 10, scale: 2 }).notNull(),
    totalCashout: decimal("total_cashout", { precision: 10, scale: 2 }).notNull(),
    profitLoss: decimal("profit_loss", { precision: 10, scale: 2 }).notNull(),
    rank: integer("rank").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [unique("results_night_user").on(table.nightId, table.userId)]
);

export const pokerNightResultsRelations = relations(
  pokerNightResults,
  ({ one }) => ({
    night: one(pokerNights, {
      fields: [pokerNightResults.nightId],
      references: [pokerNights.id],
    }),
    user: one(userProfiles, {
      fields: [pokerNightResults.userId],
      references: [userProfiles.id],
    }),
    participant: one(pokerNightParticipants, {
      fields: [pokerNightResults.participantId],
      references: [pokerNightParticipants.id],
    }),
  })
);
