import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const requests = sqliteTable("requests", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  workType: text("work_type").notNull(),
  description: text("description").notNull(),
  photoUrls: text("photo_urls"),
  status: text("status", {
    enum: ["pending", "in_progress", "done", "cancelled"],
  })
    .notNull()
    .default("pending"),
  adminNotes: text("admin_notes"),
  queuePosition: integer("queue_position").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export type Request = typeof requests.$inferSelect;
export type NewRequest = typeof requests.$inferInsert;
