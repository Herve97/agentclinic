import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Decision D2: the five Phase 2 columns permit null. SQLite cannot add a
// NOT NULL column to a populated table without a default, and Phase 1's rows
// genuinely have no values for these fields. The requirement lives at the Zod
// boundary in src/domain/case.ts instead of being satisfied by invented
// clinical content.
export const cases = sqliteTable("cases", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  complaint: text("complaint").notNull(),
  duration: text("duration"),
  requirementRevisions: integer("requirement_revisions"),
  priorEpisodes: integer("prior_episodes"),
  humanSaid: text("human_said"),
  humanMeant: text("human_meant"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

export type CaseRow = typeof cases.$inferSelect;
