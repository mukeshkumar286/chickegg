var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/db-storage.ts
import { eq, desc, and, lte, gte } from "drizzle-orm";

// server/db.ts
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  chickenBatches: () => chickenBatches,
  financialEntries: () => financialEntries,
  healthRecords: () => healthRecords,
  insertChickenBatchSchema: () => insertChickenBatchSchema,
  insertFinancialEntrySchema: () => insertFinancialEntrySchema,
  insertHealthRecordSchema: () => insertHealthRecordSchema,
  insertInventoryItemSchema: () => insertInventoryItemSchema,
  insertMaintenanceTaskSchema: () => insertMaintenanceTaskSchema,
  insertProductionRecordSchema: () => insertProductionRecordSchema,
  insertResearchNoteSchema: () => insertResearchNoteSchema,
  insertUserSchema: () => insertUserSchema,
  inventoryItems: () => inventoryItems,
  maintenanceTasks: () => maintenanceTasks,
  productionRecords: () => productionRecords,
  researchNotes: () => researchNotes,
  users: () => users
});
import { pgTable, text, serial, integer, real, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var financialEntries = pgTable("financial_entries", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull().defaultNow(),
  amount: real("amount").notNull(),
  type: text("type").notNull(),
  // "income", "expense", "investment", "capital"
  category: text("category").notNull(),
  description: text("description"),
  tags: text("tags").array()
});
var insertFinancialEntrySchema = createInsertSchema(financialEntries).omit({
  id: true
}).extend({
  date: z.coerce.date()
});
var productionRecords = pgTable("production_records", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull().defaultNow(),
  eggCount: integer("egg_count").notNull(),
  gradeA: integer("grade_a"),
  gradeB: integer("grade_b"),
  broken: integer("broken"),
  notes: text("notes"),
  batchId: text("batch_id")
});
var insertProductionRecordSchema = createInsertSchema(productionRecords).omit({
  id: true
}).extend({
  date: z.coerce.date()
});
var chickenBatches = pgTable("chicken_batches", {
  id: serial("id").primaryKey(),
  batchId: text("batch_id").notNull().unique(),
  breed: text("breed").notNull(),
  quantity: integer("quantity").notNull(),
  acquisitionDate: timestamp("acquisition_date").notNull(),
  status: text("status").notNull(),
  // "active", "sold", "deceased"
  notes: text("notes")
});
var insertChickenBatchSchema = createInsertSchema(chickenBatches).omit({
  id: true
}).extend({
  acquisitionDate: z.coerce.date()
});
var healthRecords = pgTable("health_records", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull().defaultNow(),
  batchId: text("batch_id").notNull(),
  mortalityCount: integer("mortality_count").default(0),
  symptoms: text("symptoms").array(),
  diagnosis: text("diagnosis"),
  treatment: text("treatment"),
  notes: text("notes")
});
var insertHealthRecordSchema = createInsertSchema(healthRecords).omit({
  id: true
}).extend({
  date: z.coerce.date()
});
var maintenanceTasks = pgTable("maintenance_tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date"),
  completed: boolean("completed").default(false),
  category: text("category").notNull(),
  // "cleaning", "repair", "routine", etc.
  priority: text("priority").default("medium")
  // "low", "medium", "high"
});
var insertMaintenanceTaskSchema = createInsertSchema(maintenanceTasks).omit({
  id: true
}).extend({
  dueDate: z.coerce.date().optional().nullable()
});
var researchNotes = pgTable("research_notes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  tags: text("tags").array(),
  category: text("category").notNull()
});
var insertResearchNoteSchema = createInsertSchema(researchNotes).omit({
  id: true
}).extend({
  date: z.coerce.date()
});
var inventoryItems = pgTable("inventory_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  // "feed", "medicine", "equipment", etc.
  quantity: real("quantity").notNull(),
  unit: text("unit").notNull(),
  // "kg", "liters", "pieces", etc.
  reorderLevel: real("reorder_level"),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
  notes: text("notes")
});
var insertInventoryItemSchema = createInsertSchema(inventoryItems).omit({
  id: true
}).extend({
  lastUpdated: z.coerce.date()
});

// server/db.ts
var { Pool } = pg;
var pool = new Pool({
  connectionString: process.env.DATABASE_URL
});
var db = drizzle(pool, { schema: schema_exports });

// server/db-storage.ts
var DbStorage = class {
  // User operations
  async getUser(id) {
    const results = await db.select().from(users).where(eq(users.id, id));
    return results[0];
  }
  async getUserByUsername(username) {
    const results = await db.select().from(users).where(eq(users.username, username));
    return results[0];
  }
  async createUser(user) {
    const results = await db.insert(users).values(user).returning();
    return results[0];
  }
  // Financial operations
  async createFinancialEntry(entry) {
    const results = await db.insert(financialEntries).values(entry).returning();
    return results[0];
  }
  async getFinancialEntries(filters) {
    const conditions = [];
    if (filters?.type) {
      conditions.push(eq(financialEntries.type, filters.type));
    }
    if (filters?.category) {
      conditions.push(eq(financialEntries.category, filters.category));
    }
    if (filters?.startDate) {
      conditions.push(gte(financialEntries.date, filters.startDate));
    }
    if (filters?.endDate) {
      conditions.push(lte(financialEntries.date, filters.endDate));
    }
    return conditions.length > 0 ? await db.select().from(financialEntries).where(and(...conditions)).orderBy(desc(financialEntries.date)) : await db.select().from(financialEntries).orderBy(desc(financialEntries.date));
  }
  async getFinancialEntryById(id) {
    const results = await db.select().from(financialEntries).where(eq(financialEntries.id, id));
    return results[0];
  }
  async updateFinancialEntry(id, entry) {
    const results = await db.update(financialEntries).set(entry).where(eq(financialEntries.id, id)).returning();
    return results[0];
  }
  async deleteFinancialEntry(id) {
    const results = await db.delete(financialEntries).where(eq(financialEntries.id, id)).returning({ id: financialEntries.id });
    return results.length > 0;
  }
  async getFinancialSummary() {
    const entries = await db.select().from(financialEntries);
    const totalCapital = entries.filter((entry) => entry.type === "capital").reduce((sum2, entry) => sum2 + entry.amount, 0);
    const totalInvestments = entries.filter((entry) => entry.type === "investment").reduce((sum2, entry) => sum2 + entry.amount, 0);
    const totalIncome = entries.filter((entry) => entry.type === "income").reduce((sum2, entry) => sum2 + entry.amount, 0);
    const totalExpenses = entries.filter((entry) => entry.type === "expense").reduce((sum2, entry) => sum2 + entry.amount, 0);
    const expensesByCategory = {};
    entries.filter((entry) => entry.type === "expense").forEach((entry) => {
      const category = entry.category;
      expensesByCategory[category] = (expensesByCategory[category] || 0) + entry.amount;
    });
    return {
      totalCapital,
      totalInvestments,
      totalIncome,
      totalExpenses,
      expensesByCategory
    };
  }
  // Production operations
  async createProductionRecord(record) {
    const results = await db.insert(productionRecords).values(record).returning();
    return results[0];
  }
  async getProductionRecords(filters) {
    const conditions = [];
    if (filters?.batchId) {
      conditions.push(eq(productionRecords.batchId, filters.batchId));
    }
    if (filters?.startDate) {
      conditions.push(gte(productionRecords.date, filters.startDate));
    }
    if (filters?.endDate) {
      conditions.push(lte(productionRecords.date, filters.endDate));
    }
    return conditions.length > 0 ? await db.select().from(productionRecords).where(and(...conditions)).orderBy(desc(productionRecords.date)) : await db.select().from(productionRecords).orderBy(desc(productionRecords.date));
  }
  async getProductionRecordById(id) {
    const results = await db.select().from(productionRecords).where(eq(productionRecords.id, id));
    return results[0];
  }
  async updateProductionRecord(id, record) {
    const results = await db.update(productionRecords).set(record).where(eq(productionRecords.id, id)).returning();
    return results[0];
  }
  async deleteProductionRecord(id) {
    const results = await db.delete(productionRecords).where(eq(productionRecords.id, id)).returning({ id: productionRecords.id });
    return results.length > 0;
  }
  async getProductionSummary(days = 30) {
    const startDate = /* @__PURE__ */ new Date();
    startDate.setDate(startDate.getDate() - days);
    const records = await db.select().from(productionRecords).where(gte(productionRecords.date, startDate));
    if (records.length === 0) {
      return {
        totalEggs: 0,
        gradeAPercentage: 0,
        gradeBPercentage: 0,
        brokenPercentage: 0,
        dailyAverage: 0
      };
    }
    const totalEggs = records.reduce((sum2, record) => sum2 + record.eggCount, 0);
    const totalGradeA = records.reduce((sum2, record) => sum2 + (record.gradeA || 0), 0);
    const totalGradeB = records.reduce((sum2, record) => sum2 + (record.gradeB || 0), 0);
    const totalBroken = records.reduce((sum2, record) => sum2 + (record.broken || 0), 0);
    const gradeAPercentage = totalEggs > 0 ? Math.round(totalGradeA / totalEggs * 100) : 0;
    const gradeBPercentage = totalEggs > 0 ? Math.round(totalGradeB / totalEggs * 100) : 0;
    const brokenPercentage = totalEggs > 0 ? Math.round(totalBroken / totalEggs * 100) : 0;
    const uniqueDays = new Set(records.map((record) => record.date.toDateString())).size;
    const dailyAverage = uniqueDays > 0 ? Math.round(totalEggs / uniqueDays) : 0;
    return {
      totalEggs,
      gradeAPercentage,
      gradeBPercentage,
      brokenPercentage,
      dailyAverage
    };
  }
  // Chicken batch operations
  async createChickenBatch(batch) {
    const results = await db.insert(chickenBatches).values(batch).returning();
    return results[0];
  }
  async getChickenBatches(filters) {
    const conditions = [];
    if (filters?.status) {
      conditions.push(eq(chickenBatches.status, filters.status));
    }
    if (filters?.breed) {
      conditions.push(eq(chickenBatches.breed, filters.breed));
    }
    return conditions.length > 0 ? await db.select().from(chickenBatches).where(and(...conditions)) : await db.select().from(chickenBatches);
  }
  async getChickenBatchById(id) {
    const results = await db.select().from(chickenBatches).where(eq(chickenBatches.id, id));
    return results[0];
  }
  async getChickenBatchByBatchId(batchId) {
    const results = await db.select().from(chickenBatches).where(eq(chickenBatches.batchId, batchId));
    return results[0];
  }
  async updateChickenBatch(id, batch) {
    const results = await db.update(chickenBatches).set(batch).where(eq(chickenBatches.id, id)).returning();
    return results[0];
  }
  async deleteChickenBatch(id) {
    const results = await db.delete(chickenBatches).where(eq(chickenBatches.id, id)).returning({ id: chickenBatches.id });
    return results.length > 0;
  }
  // Health records operations
  async createHealthRecord(record) {
    const results = await db.insert(healthRecords).values(record).returning();
    return results[0];
  }
  async getHealthRecords(filters) {
    const conditions = [];
    if (filters?.batchId) {
      conditions.push(eq(healthRecords.batchId, filters.batchId));
    }
    if (filters?.startDate) {
      conditions.push(gte(healthRecords.date, filters.startDate));
    }
    if (filters?.endDate) {
      conditions.push(lte(healthRecords.date, filters.endDate));
    }
    return conditions.length > 0 ? await db.select().from(healthRecords).where(and(...conditions)).orderBy(desc(healthRecords.date)) : await db.select().from(healthRecords).orderBy(desc(healthRecords.date));
  }
  async getHealthRecordById(id) {
    const results = await db.select().from(healthRecords).where(eq(healthRecords.id, id));
    return results[0];
  }
  async updateHealthRecord(id, record) {
    const results = await db.update(healthRecords).set(record).where(eq(healthRecords.id, id)).returning();
    return results[0];
  }
  async deleteHealthRecord(id) {
    const results = await db.delete(healthRecords).where(eq(healthRecords.id, id)).returning({ id: healthRecords.id });
    return results.length > 0;
  }
  async getHealthSummary() {
    const records = await db.select().from(healthRecords);
    const batches = await db.select().from(chickenBatches);
    const totalMortality = records.reduce((sum2, record) => sum2 + (record.mortalityCount || 0), 0);
    const totalChickens = batches.reduce((sum2, batch) => sum2 + batch.quantity, 0);
    const healthyPercentage = totalChickens > 0 ? Math.round((totalChickens - totalMortality) / totalChickens * 100) : 100;
    const symptomsMap = /* @__PURE__ */ new Map();
    records.forEach((record) => {
      if (record.symptoms) {
        record.symptoms.forEach((symptom) => {
          symptomsMap.set(symptom, (symptomsMap.get(symptom) || 0) + 1);
        });
      }
    });
    const sortedSymptoms = Array.from(symptomsMap.entries()).sort((a, b) => b[1] - a[1]).map((entry) => entry[0]).slice(0, 5);
    return {
      totalMortality,
      healthyPercentage,
      commonSymptoms: sortedSymptoms
    };
  }
  // Maintenance tasks operations
  async createMaintenanceTask(task) {
    const results = await db.insert(maintenanceTasks).values({
      ...task,
      completed: task.completed ?? false
    }).returning();
    return results[0];
  }
  async getMaintenanceTasks(filters) {
    const conditions = [];
    if (filters?.completed !== void 0) {
      conditions.push(eq(maintenanceTasks.completed, filters.completed));
    }
    if (filters?.category) {
      conditions.push(eq(maintenanceTasks.category, filters.category));
    }
    if (filters?.priority) {
      conditions.push(eq(maintenanceTasks.priority, filters.priority));
    }
    return conditions.length > 0 ? await db.select().from(maintenanceTasks).where(and(...conditions)) : await db.select().from(maintenanceTasks);
  }
  async getMaintenanceTaskById(id) {
    const results = await db.select().from(maintenanceTasks).where(eq(maintenanceTasks.id, id));
    return results[0];
  }
  async updateMaintenanceTask(id, task) {
    const results = await db.update(maintenanceTasks).set(task).where(eq(maintenanceTasks.id, id)).returning();
    return results[0];
  }
  async deleteMaintenanceTask(id) {
    const results = await db.delete(maintenanceTasks).where(eq(maintenanceTasks.id, id)).returning({ id: maintenanceTasks.id });
    return results.length > 0;
  }
  async toggleTaskCompletion(id) {
    const task = await this.getMaintenanceTaskById(id);
    if (!task) return void 0;
    const results = await db.update(maintenanceTasks).set({ completed: !task.completed }).where(eq(maintenanceTasks.id, id)).returning();
    return results[0];
  }
  // Research notes operations
  async createResearchNote(note) {
    const results = await db.insert(researchNotes).values(note).returning();
    return results[0];
  }
  async getResearchNotes(filters) {
    const conditions = [];
    if (filters?.category) {
      conditions.push(eq(researchNotes.category, filters.category));
    }
    if (filters?.startDate) {
      conditions.push(gte(researchNotes.date, filters.startDate));
    }
    if (filters?.endDate) {
      conditions.push(lte(researchNotes.date, filters.endDate));
    }
    let notes = conditions.length > 0 ? await db.select().from(researchNotes).where(and(...conditions)).orderBy(desc(researchNotes.date)) : await db.select().from(researchNotes).orderBy(desc(researchNotes.date));
    if (filters?.tags && filters.tags.length > 0) {
      notes = notes.filter((note) => {
        if (!note.tags) return false;
        return filters.tags.some((tag) => note.tags.includes(tag));
      });
    }
    return notes;
  }
  async getResearchNoteById(id) {
    const results = await db.select().from(researchNotes).where(eq(researchNotes.id, id));
    return results[0];
  }
  async updateResearchNote(id, note) {
    const results = await db.update(researchNotes).set(note).where(eq(researchNotes.id, id)).returning();
    return results[0];
  }
  async deleteResearchNote(id) {
    const results = await db.delete(researchNotes).where(eq(researchNotes.id, id)).returning({ id: researchNotes.id });
    return results.length > 0;
  }
  // Inventory operations
  async createInventoryItem(item) {
    const results = await db.insert(inventoryItems).values({
      ...item,
      lastUpdated: /* @__PURE__ */ new Date()
    }).returning();
    return results[0];
  }
  async getInventoryItems(filters) {
    const conditions = [];
    if (filters?.category) {
      conditions.push(eq(inventoryItems.category, filters.category));
    }
    let items = conditions.length > 0 ? await db.select().from(inventoryItems).where(and(...conditions)) : await db.select().from(inventoryItems);
    if (filters?.belowReorderLevel) {
      items = items.filter(
        (item) => item.reorderLevel !== null && item.quantity <= item.reorderLevel
      );
    }
    return items;
  }
  async getInventoryItemById(id) {
    const results = await db.select().from(inventoryItems).where(eq(inventoryItems.id, id));
    return results[0];
  }
  async updateInventoryItem(id, item) {
    const updatedItem = {
      ...item,
      lastUpdated: /* @__PURE__ */ new Date()
    };
    const results = await db.update(inventoryItems).set(updatedItem).where(eq(inventoryItems.id, id)).returning();
    return results[0];
  }
  async deleteInventoryItem(id) {
    const results = await db.delete(inventoryItems).where(eq(inventoryItems.id, id)).returning({ id: inventoryItems.id });
    return results.length > 0;
  }
  async updateInventoryQuantity(id, adjustment) {
    const item = await this.getInventoryItemById(id);
    if (!item) return void 0;
    const newQuantity = item.quantity + adjustment;
    if (newQuantity < 0) return void 0;
    const results = await db.update(inventoryItems).set({
      quantity: newQuantity,
      lastUpdated: /* @__PURE__ */ new Date()
    }).where(eq(inventoryItems.id, id)).returning();
    return results[0];
  }
};

// server/storage.ts
var storage = new DbStorage();
function setStorage(newStorage) {
  storage = newStorage;
}

// server/routes.ts
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

// server/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import createMemoryStore from "memorystore";
var MemoryStore = createMemoryStore(session);
var scryptAsync = promisify(scrypt);
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return timingSafeEqual(hashedBuf, suppliedBuf);
}
async function createAdminUser() {
  try {
    const existingUser = await storage.getUserByUsername("admin");
    if (!existingUser) {
      const hashedPassword = await hashPassword("ChickEgg@897");
      await storage.createUser({
        username: "admin",
        password: hashedPassword
      });
      console.log("Admin user created successfully");
    } else {
      console.log("Admin user already exists");
    }
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
}
function setupAuth(app2) {
  const sessionStore = new MemoryStore({
    checkPeriod: 864e5
    // Prune expired entries every 24h
  });
  const sessionSettings = {
    secret: process.env.SESSION_SECRET || "chicken-farm-secret-key",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      maxAge: 24 * 60 * 60 * 1e3,
      // 1 day
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax"
    }
  };
  app2.set("trust proxy", 1);
  app2.use(session(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Incorrect username." });
        }
        const isValid = await comparePasswords(password, user.password);
        if (!isValid) {
          return done(null, false, { message: "Incorrect password." });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
  app2.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Authentication failed" });
      }
      req.login(user, (err2) => {
        if (err2) {
          return next(err2);
        }
        return res.json({
          id: user.id,
          username: user.username
        });
      });
    })(req, res, next);
  });
  app2.post("/api/logout", (req, res) => {
    req.logout(() => {
      res.status(200).json({ message: "Logged out successfully" });
    });
  });
  app2.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json({
      id: req.user?.id,
      username: req.user?.username
    });
  });
}
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Not authenticated" });
}

// server/routes.ts
async function registerRoutes(app2) {
  const validateBody = (schema) => {
    return (req, res, next) => {
      try {
        req.validatedBody = schema.parse(req.body);
        next();
      } catch (error) {
        if (error instanceof ZodError) {
          const validationError = fromZodError(error);
          res.status(400).json({ message: validationError.message });
        } else {
          res.status(500).json({ message: "Unknown validation error" });
        }
      }
    };
  };
  app2.get("/api/financials", isAuthenticated, async (req, res) => {
    const type = req.query.type;
    const category = req.query.category;
    const startDate = req.query.startDate ? new Date(req.query.startDate) : void 0;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : void 0;
    const entries = await storage.getFinancialEntries({
      type,
      category,
      startDate,
      endDate
    });
    res.json(entries);
  });
  app2.get("/api/financials/summary", async (req, res) => {
    const summary = await storage.getFinancialSummary();
    res.json(summary);
  });
  app2.get("/api/financials/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    const entry = await storage.getFinancialEntryById(id);
    if (!entry) {
      return res.status(404).json({ message: "Financial entry not found" });
    }
    res.json(entry);
  });
  app2.post("/api/financials", validateBody(insertFinancialEntrySchema), async (req, res) => {
    const entry = await storage.createFinancialEntry(req.validatedBody);
    res.status(201).json(entry);
  });
  app2.patch("/api/financials/:id", validateBody(insertFinancialEntrySchema.partial()), async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    const updatedEntry = await storage.updateFinancialEntry(id, req.validatedBody);
    if (!updatedEntry) {
      return res.status(404).json({ message: "Financial entry not found" });
    }
    res.json(updatedEntry);
  });
  app2.delete("/api/financials/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    const success = await storage.deleteFinancialEntry(id);
    if (!success) {
      return res.status(404).json({ message: "Financial entry not found" });
    }
    res.status(204).send();
  });
  app2.get("/api/production", async (req, res) => {
    const batchId = req.query.batchId;
    const startDate = req.query.startDate ? new Date(req.query.startDate) : void 0;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : void 0;
    const records = await storage.getProductionRecords({
      batchId,
      startDate,
      endDate
    });
    res.json(records);
  });
  app2.get("/api/production/summary", async (req, res) => {
    const days = req.query.days ? parseInt(req.query.days) : 30;
    const summary = await storage.getProductionSummary(days);
    res.json(summary);
  });
  app2.get("/api/production/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    const record = await storage.getProductionRecordById(id);
    if (!record) {
      return res.status(404).json({ message: "Production record not found" });
    }
    res.json(record);
  });
  app2.post("/api/production", validateBody(insertProductionRecordSchema), async (req, res) => {
    const record = await storage.createProductionRecord(req.validatedBody);
    res.status(201).json(record);
  });
  app2.patch("/api/production/:id", validateBody(insertProductionRecordSchema.partial()), async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    const updatedRecord = await storage.updateProductionRecord(id, req.validatedBody);
    if (!updatedRecord) {
      return res.status(404).json({ message: "Production record not found" });
    }
    res.json(updatedRecord);
  });
  app2.delete("/api/production/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    const success = await storage.deleteProductionRecord(id);
    if (!success) {
      return res.status(404).json({ message: "Production record not found" });
    }
    res.status(204).send();
  });
  app2.get("/api/chickens", async (req, res) => {
    const status = req.query.status;
    const breed = req.query.breed;
    const batches = await storage.getChickenBatches({
      status,
      breed
    });
    res.json(batches);
  });
  app2.get("/api/chickens/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    const batch = await storage.getChickenBatchById(id);
    if (!batch) {
      return res.status(404).json({ message: "Chicken batch not found" });
    }
    res.json(batch);
  });
  app2.post("/api/chickens", validateBody(insertChickenBatchSchema), async (req, res) => {
    const batch = await storage.createChickenBatch(req.validatedBody);
    res.status(201).json(batch);
  });
  app2.put("/api/chickens/:id", validateBody(insertChickenBatchSchema.partial()), async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    const updatedBatch = await storage.updateChickenBatch(id, req.validatedBody);
    if (!updatedBatch) {
      return res.status(404).json({ message: "Chicken batch not found" });
    }
    res.json(updatedBatch);
  });
  app2.delete("/api/chickens/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    const success = await storage.deleteChickenBatch(id);
    if (!success) {
      return res.status(404).json({ message: "Chicken batch not found" });
    }
    res.status(204).send();
  });
  app2.get("/api/health", async (req, res) => {
    const batchId = req.query.batchId;
    const startDate = req.query.startDate ? new Date(req.query.startDate) : void 0;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : void 0;
    const records = await storage.getHealthRecords({
      batchId,
      startDate,
      endDate
    });
    res.json(records);
  });
  app2.get("/api/health/summary", async (req, res) => {
    const summary = await storage.getHealthSummary();
    res.json(summary);
  });
  app2.get("/api/health/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    const record = await storage.getHealthRecordById(id);
    if (!record) {
      return res.status(404).json({ message: "Health record not found" });
    }
    res.json(record);
  });
  app2.post("/api/health", validateBody(insertHealthRecordSchema), async (req, res) => {
    const record = await storage.createHealthRecord(req.validatedBody);
    res.status(201).json(record);
  });
  app2.put("/api/health/:id", validateBody(insertHealthRecordSchema.partial()), async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    const updatedRecord = await storage.updateHealthRecord(id, req.validatedBody);
    if (!updatedRecord) {
      return res.status(404).json({ message: "Health record not found" });
    }
    res.json(updatedRecord);
  });
  app2.delete("/api/health/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    const success = await storage.deleteHealthRecord(id);
    if (!success) {
      return res.status(404).json({ message: "Health record not found" });
    }
    res.status(204).send();
  });
  app2.get("/api/tasks", async (req, res) => {
    const completed = req.query.completed ? req.query.completed === "true" : void 0;
    const category = req.query.category;
    const priority = req.query.priority;
    const tasks = await storage.getMaintenanceTasks({
      completed,
      category,
      priority
    });
    res.json(tasks);
  });
  app2.get("/api/tasks/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    const task = await storage.getMaintenanceTaskById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json(task);
  });
  app2.post("/api/tasks", validateBody(insertMaintenanceTaskSchema), async (req, res) => {
    const task = await storage.createMaintenanceTask(req.validatedBody);
    res.status(201).json(task);
  });
  app2.put("/api/tasks/:id", validateBody(insertMaintenanceTaskSchema.partial()), async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    const updatedTask = await storage.updateMaintenanceTask(id, req.validatedBody);
    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json(updatedTask);
  });
  app2.post("/api/tasks/:id/toggle", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    const updatedTask = await storage.toggleTaskCompletion(id);
    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json(updatedTask);
  });
  app2.delete("/api/tasks/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    const success = await storage.deleteMaintenanceTask(id);
    if (!success) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(204).send();
  });
  app2.get("/api/notes", async (req, res) => {
    const category = req.query.category;
    const tags = req.query.tags ? req.query.tags.split(",") : void 0;
    const startDate = req.query.startDate ? new Date(req.query.startDate) : void 0;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : void 0;
    const notes = await storage.getResearchNotes({
      category,
      tags,
      startDate,
      endDate
    });
    res.json(notes);
  });
  app2.get("/api/notes/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    const note = await storage.getResearchNoteById(id);
    if (!note) {
      return res.status(404).json({ message: "Research note not found" });
    }
    res.json(note);
  });
  app2.post("/api/notes", validateBody(insertResearchNoteSchema), async (req, res) => {
    const note = await storage.createResearchNote(req.validatedBody);
    res.status(201).json(note);
  });
  app2.put("/api/notes/:id", validateBody(insertResearchNoteSchema.partial()), async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    const updatedNote = await storage.updateResearchNote(id, req.validatedBody);
    if (!updatedNote) {
      return res.status(404).json({ message: "Research note not found" });
    }
    res.json(updatedNote);
  });
  app2.delete("/api/notes/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    const success = await storage.deleteResearchNote(id);
    if (!success) {
      return res.status(404).json({ message: "Research note not found" });
    }
    res.status(204).send();
  });
  app2.get("/api/inventory", async (req, res) => {
    const category = req.query.category;
    const belowReorderLevel = req.query.belowReorderLevel === "true";
    const items = await storage.getInventoryItems({
      category,
      belowReorderLevel: belowReorderLevel || void 0
    });
    res.json(items);
  });
  app2.get("/api/inventory/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    const item = await storage.getInventoryItemById(id);
    if (!item) {
      return res.status(404).json({ message: "Inventory item not found" });
    }
    res.json(item);
  });
  app2.post("/api/inventory", validateBody(insertInventoryItemSchema), async (req, res) => {
    const item = await storage.createInventoryItem(req.validatedBody);
    res.status(201).json(item);
  });
  app2.put("/api/inventory/:id", validateBody(insertInventoryItemSchema.partial()), async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    const updatedItem = await storage.updateInventoryItem(id, req.validatedBody);
    if (!updatedItem) {
      return res.status(404).json({ message: "Inventory item not found" });
    }
    res.json(updatedItem);
  });
  app2.post("/api/inventory/:id/adjust", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    const { adjustment } = req.body;
    if (typeof adjustment !== "number") {
      return res.status(400).json({ message: "Adjustment must be a number" });
    }
    const updatedItem = await storage.updateInventoryQuantity(id, adjustment);
    if (!updatedItem) {
      return res.status(404).json({ message: "Inventory item not found" });
    }
    res.json(updatedItem);
  });
  app2.delete("/api/inventory/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    const success = await storage.deleteInventoryItem(id);
    if (!success) {
      return res.status(404).json({ message: "Inventory item not found" });
    }
    res.status(204).send();
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/migration.ts
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg2 from "pg";
var { Pool: Pool2 } = pg2;
async function runMigrations() {
  console.log("Running database migrations...");
  try {
    const pool2 = new Pool2({
      connectionString: process.env.DATABASE_URL
    });
    const tablesResult = await pool2.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    const existingTables = tablesResult.rows.map((row) => row.table_name);
    if (existingTables.includes("chicken_batches")) {
      console.log("Tables already exist, skipping migrations.");
      await pool2.end();
      return;
    }
    await pool2.end();
    await migrate(db, { migrationsFolder: "./migrations" });
    console.log("Migrations completed successfully.");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

// server/index.ts
var FallbackStorage = class {
  // User operations
  async getUser(id) {
    return void 0;
  }
  async getUserByUsername(username) {
    return void 0;
  }
  async createUser(user) {
    return {
      id: 1,
      username: user.username,
      password: user.password
    };
  }
  // Financial operations
  async createFinancialEntry(entry) {
    return {
      id: 1,
      date: /* @__PURE__ */ new Date(),
      type: entry.type,
      amount: entry.amount,
      category: entry.category,
      description: entry.description || null,
      tags: entry.tags || null
    };
  }
  async getFinancialEntries() {
    return [];
  }
  async getFinancialEntryById(id) {
    return void 0;
  }
  async updateFinancialEntry(id, entry) {
    return void 0;
  }
  async deleteFinancialEntry(id) {
    return false;
  }
  async getFinancialSummary() {
    return {
      totalCapital: 0,
      totalInvestments: 0,
      totalIncome: 0,
      totalExpenses: 0,
      expensesByCategory: {}
    };
  }
  // Production operations
  async createProductionRecord(record) {
    return {
      id: 1,
      date: /* @__PURE__ */ new Date(),
      eggCount: record.eggCount,
      gradeA: record.gradeA || null,
      gradeB: record.gradeB || null,
      broken: record.broken || null,
      notes: record.notes || null,
      batchId: record.batchId || null
    };
  }
  async getProductionRecords() {
    return [];
  }
  async getProductionRecordById(id) {
    return void 0;
  }
  async updateProductionRecord(id, record) {
    return void 0;
  }
  async deleteProductionRecord(id) {
    return false;
  }
  async getProductionSummary() {
    return {
      totalEggs: 0,
      gradeAPercentage: 0,
      gradeBPercentage: 0,
      brokenPercentage: 0,
      dailyAverage: 0
    };
  }
  // Chicken batch operations
  async createChickenBatch(batch) {
    return {
      id: 1,
      status: batch.status,
      batchId: batch.batchId,
      breed: batch.breed,
      quantity: batch.quantity,
      acquisitionDate: batch.acquisitionDate,
      notes: batch.notes || null
    };
  }
  async getChickenBatches() {
    return [];
  }
  async getChickenBatchById(id) {
    return void 0;
  }
  async getChickenBatchByBatchId(batchId) {
    return void 0;
  }
  async updateChickenBatch(id, batch) {
    return void 0;
  }
  async deleteChickenBatch(id) {
    return false;
  }
  // Health records operations
  async createHealthRecord(record) {
    return {
      id: 1,
      date: /* @__PURE__ */ new Date(),
      batchId: record.batchId,
      notes: record.notes || null,
      mortalityCount: record.mortalityCount || null,
      symptoms: record.symptoms || null,
      diagnosis: record.diagnosis || null,
      treatment: record.treatment || null
    };
  }
  async getHealthRecords() {
    return [];
  }
  async getHealthRecordById(id) {
    return void 0;
  }
  async updateHealthRecord(id, record) {
    return void 0;
  }
  async deleteHealthRecord(id) {
    return false;
  }
  async getHealthSummary() {
    return {
      totalMortality: 0,
      healthyPercentage: 0,
      commonSymptoms: []
    };
  }
  // Maintenance tasks operations
  async createMaintenanceTask(task) {
    return {
      id: 1,
      category: task.category,
      title: task.title,
      description: task.description || null,
      dueDate: task.dueDate || null,
      completed: task.completed || null,
      priority: task.priority || null
    };
  }
  async getMaintenanceTasks() {
    return [];
  }
  async getMaintenanceTaskById(id) {
    return void 0;
  }
  async updateMaintenanceTask(id, task) {
    return void 0;
  }
  async deleteMaintenanceTask(id) {
    return false;
  }
  async toggleTaskCompletion(id) {
    return void 0;
  }
  // Research notes operations
  async createResearchNote(note) {
    return {
      id: 1,
      date: /* @__PURE__ */ new Date(),
      category: note.category,
      title: note.title,
      content: note.content,
      tags: note.tags || null
    };
  }
  async getResearchNotes() {
    return [];
  }
  async getResearchNoteById(id) {
    return void 0;
  }
  async updateResearchNote(id, note) {
    return void 0;
  }
  async deleteResearchNote(id) {
    return false;
  }
  // Inventory operations
  async createInventoryItem(item) {
    return {
      id: 1,
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      notes: item.notes || null,
      reorderLevel: item.reorderLevel || null,
      lastUpdated: item.lastUpdated || /* @__PURE__ */ new Date()
    };
  }
  async getInventoryItems() {
    return [];
  }
  async getInventoryItemById(id) {
    return void 0;
  }
  async updateInventoryItem(id, item) {
    return void 0;
  }
  async deleteInventoryItem(id) {
    return false;
  }
  async updateInventoryQuantity(id, adjustment) {
    return void 0;
  }
};
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  try {
    await runMigrations();
    const dbStorage = new DbStorage();
    setStorage(dbStorage);
    log("Database initialized successfully");
    setupAuth(app);
    await createAdminUser();
  } catch (error) {
    console.error("Database initialization error:", error);
    log("Error initializing database, falling back to simple storage", "error");
    const fallbackStorage = new FallbackStorage();
    setStorage(fallbackStorage);
  }
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = process.env.PORT || 5e3;
  server.listen({
    port: Number(port),
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
