import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const editorSectionsTable = pgTable("editor_sections", {
  id: serial("id").primaryKey(),
  sectionId: text("section_id").notNull(),
  type: text("type").notNull(),
  order: integer("order").notNull(),
  visible: boolean("visible").notNull().default(true),
  data: jsonb("data").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertEditorSectionSchema = createInsertSchema(editorSectionsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertEditorSection = z.infer<typeof insertEditorSectionSchema>;
export type EditorSection = typeof editorSectionsTable.$inferSelect;
