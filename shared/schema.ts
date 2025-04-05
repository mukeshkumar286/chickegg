import { pgTable, text, serial, integer, real, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Financial models
export const financialEntries = pgTable("financial_entries", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull().defaultNow(),
  amount: real("amount").notNull(),
  type: text("type").notNull(), // "income", "expense", "investment", "capital"
  category: text("category").notNull(),
  description: text("description"),
  tags: text("tags").array(),
});

export const insertFinancialEntrySchema = createInsertSchema(financialEntries)
  .omit({
    id: true,
  })
  .extend({
    date: z.coerce.date(),
  });

export type InsertFinancialEntry = z.infer<typeof insertFinancialEntrySchema>;
export type FinancialEntry = typeof financialEntries.$inferSelect;

// Production tracking
export const productionRecords = pgTable("production_records", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull().defaultNow(),
  eggCount: integer("egg_count").notNull(),
  gradeA: integer("grade_a"),
  gradeB: integer("grade_b"),
  broken: integer("broken"),
  notes: text("notes"),
  batchId: text("batch_id"),
});

export const insertProductionRecordSchema = createInsertSchema(productionRecords)
  .omit({
    id: true,
  })
  .extend({
    date: z.coerce.date(),
  });

export type InsertProductionRecord = z.infer<typeof insertProductionRecordSchema>;
export type ProductionRecord = typeof productionRecords.$inferSelect;

// Chicken health tracking
export const chickenBatches = pgTable("chicken_batches", {
  id: serial("id").primaryKey(),
  batchId: text("batch_id").notNull().unique(),
  breed: text("breed").notNull(),
  quantity: integer("quantity").notNull(),
  acquisitionDate: timestamp("acquisition_date").notNull(),
  status: text("status").notNull(), // "active", "sold", "deceased"
  notes: text("notes"),
});

export const insertChickenBatchSchema = createInsertSchema(chickenBatches)
  .omit({
    id: true,
  })
  .extend({
    acquisitionDate: z.coerce.date(),
  });

export type InsertChickenBatch = z.infer<typeof insertChickenBatchSchema>;
export type ChickenBatch = typeof chickenBatches.$inferSelect;

export const healthRecords = pgTable("health_records", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull().defaultNow(),
  batchId: text("batch_id").notNull(),
  mortalityCount: integer("mortality_count").default(0),
  symptoms: text("symptoms").array(),
  diagnosis: text("diagnosis"),
  treatment: text("treatment"),
  notes: text("notes"),
});

export const insertHealthRecordSchema = createInsertSchema(healthRecords)
  .omit({
    id: true,
  })
  .extend({
    date: z.coerce.date(),
  });

export type InsertHealthRecord = z.infer<typeof insertHealthRecordSchema>;
export type HealthRecord = typeof healthRecords.$inferSelect;

// Maintenance tasks
export const maintenanceTasks = pgTable("maintenance_tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date"),
  completed: boolean("completed").default(false),
  category: text("category").notNull(), // "cleaning", "repair", "routine", etc.
  priority: text("priority").default("medium"), // "low", "medium", "high"
});

export const insertMaintenanceTaskSchema = createInsertSchema(maintenanceTasks)
  .omit({
    id: true,
  })
  .extend({
    dueDate: z.coerce.date().optional().nullable(),
  });

export type InsertMaintenanceTask = z.infer<typeof insertMaintenanceTaskSchema>;
export type MaintenanceTask = typeof maintenanceTasks.$inferSelect;

// Research notes
export const researchNotes = pgTable("research_notes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  tags: text("tags").array(),
  category: text("category").notNull(),
});

export const insertResearchNoteSchema = createInsertSchema(researchNotes)
  .omit({
    id: true,
  })
  .extend({
    date: z.coerce.date(),
  });

export type InsertResearchNote = z.infer<typeof insertResearchNoteSchema>;
export type ResearchNote = typeof researchNotes.$inferSelect;

// Inventory tracking
export const inventoryItems = pgTable("inventory_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // "feed", "medicine", "equipment", etc.
  quantity: real("quantity").notNull(),
  unit: text("unit").notNull(), // "kg", "liters", "pieces", etc.
  reorderLevel: real("reorder_level"),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
  notes: text("notes"),
});

export const insertInventoryItemSchema = createInsertSchema(inventoryItems)
  .omit({
    id: true,
  })
  .extend({
    lastUpdated: z.coerce.date(),
  });

export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;
export type InventoryItem = typeof inventoryItems.$inferSelect;
