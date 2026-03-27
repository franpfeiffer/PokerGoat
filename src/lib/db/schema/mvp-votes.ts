import {
  pgTable,
  uuid,
  timestamp,
  unique,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { pokerNights } from "./poker-nights";
import { userProfiles } from "./users";

export const mvpVotes = pgTable(
  "mvp_votes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    nightId: uuid("night_id")
      .notNull()
      .references(() => pokerNights.id, { onDelete: "cascade" }),
    voterId: uuid("voter_id")
      .notNull()
      .references(() => userProfiles.id),
    candidateId: uuid("candidate_id")
      .notNull()
      .references(() => userProfiles.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("mvp_vote_unique").on(table.nightId, table.voterId),
    index("mvp_votes_night_id_idx").on(table.nightId),
  ]
);

export const mvpVotesRelations = relations(mvpVotes, ({ one }) => ({
  night: one(pokerNights, {
    fields: [mvpVotes.nightId],
    references: [pokerNights.id],
  }),
  voter: one(userProfiles, {
    fields: [mvpVotes.voterId],
    references: [userProfiles.id],
    relationName: "voter",
  }),
  candidate: one(userProfiles, {
    fields: [mvpVotes.candidateId],
    references: [userProfiles.id],
    relationName: "candidate",
  }),
}));
