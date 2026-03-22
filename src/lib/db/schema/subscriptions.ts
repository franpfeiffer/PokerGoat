import {
  pgTable,
  pgEnum,
  uuid,
  text,
  decimal,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { userProfiles } from "./users";

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "pending",
  "authorized",
  "paused",
  "cancelled",
]);

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => userProfiles.id)
    .unique(),
  mpPreapprovalId: text("mp_preapproval_id").unique(),
  mpPayerEmail: text("mp_payer_email"),
  status: subscriptionStatusEnum("status").notNull().default("pending"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("ARS"),
  currentPeriodStart: timestamp("current_period_start", { withTimezone: true }),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(userProfiles, {
    fields: [subscriptions.userId],
    references: [userProfiles.id],
  }),
}));
