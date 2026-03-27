import {
  pgTable,
  uuid,
  integer,
  decimal,
  timestamp,
  unique,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { pokerNights } from "./poker-nights";
import { userProfiles } from "./users";
import { pokerNightResults } from "./results";

export const pokerNightParticipants = pgTable(
  "poker_night_participants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    nightId: uuid("night_id")
      .notNull()
      .references(() => pokerNights.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => userProfiles.id),
    buyInCount: integer("buy_in_count").notNull().default(1),
    rebuyTotal: decimal("rebuy_total", { precision: 10, scale: 2 }).notNull().default("0"),
    chipsBlackEnd: integer("chips_black_end"),
    chipsWhiteEnd: integer("chips_white_end"),
    chipsRedEnd: integer("chips_red_end"),
    chipsGreenEnd: integer("chips_green_end"),
    chipsBlueEnd: integer("chips_blue_end"),
    totalChipsEnd: integer("total_chips_end"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("participants_night_user").on(table.nightId, table.userId),
    index("participants_night_id_idx").on(table.nightId),
  ]
);

export const pokerNightParticipantsRelations = relations(
  pokerNightParticipants,
  ({ one }) => ({
    night: one(pokerNights, {
      fields: [pokerNightParticipants.nightId],
      references: [pokerNights.id],
    }),
    user: one(userProfiles, {
      fields: [pokerNightParticipants.userId],
      references: [userProfiles.id],
    }),
    result: one(pokerNightResults, {
      fields: [pokerNightParticipants.id],
      references: [pokerNightResults.participantId],
    }),
  })
);
