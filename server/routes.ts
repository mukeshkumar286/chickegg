import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertFinancialEntrySchema, 
  insertProductionRecordSchema,
  insertChickenBatchSchema,
  insertHealthRecordSchema,
  insertMaintenanceTaskSchema,
  insertResearchNoteSchema,
  insertInventoryItemSchema
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { isAuthenticated } from "./auth";

// Extend Express Request type to include validatedBody
declare global {
  namespace Express {
    interface Request {
      validatedBody: any;
    }
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Helper to handle zod validation and error responses
  const validateBody = <T>(schema: z.ZodType<T>) => {
    return (req: Request, res: Response, next: NextFunction) => {
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

  // Financial entries
  app.get("/api/financials", isAuthenticated, async (req, res) => {
    const type = req.query.type as string | undefined;
    const category = req.query.category as string | undefined;
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

    const entries = await storage.getFinancialEntries({
      type,
      category,
      startDate,
      endDate,
    });

    res.json(entries);
  });

  app.get("/api/financials/summary", async (req, res) => {
    const summary = await storage.getFinancialSummary();
    res.json(summary);
  });

  app.get("/api/financials/:id", async (req, res) => {
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

  app.post("/api/financials", validateBody(insertFinancialEntrySchema), async (req, res) => {
    const entry = await storage.createFinancialEntry(req.validatedBody);
    res.status(201).json(entry);
  });

  app.patch("/api/financials/:id", validateBody(insertFinancialEntrySchema.partial()), async (req, res) => {
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

  app.delete("/api/financials/:id", async (req, res) => {
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

  // Production records
  app.get("/api/production", async (req, res) => {
    const batchId = req.query.batchId as string | undefined;
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

    const records = await storage.getProductionRecords({
      batchId,
      startDate,
      endDate,
    });

    res.json(records);
  });

  app.get("/api/production/summary", async (req, res) => {
    const days = req.query.days ? parseInt(req.query.days as string) : 30;
    const summary = await storage.getProductionSummary(days);
    res.json(summary);
  });

  app.get("/api/production/:id", async (req, res) => {
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

  app.post("/api/production", validateBody(insertProductionRecordSchema), async (req, res) => {
    const record = await storage.createProductionRecord(req.validatedBody);
    res.status(201).json(record);
  });

  app.patch("/api/production/:id", validateBody(insertProductionRecordSchema.partial()), async (req, res) => {
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

  app.delete("/api/production/:id", async (req, res) => {
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

  // Chicken batches
  app.get("/api/chickens", async (req, res) => {
    const status = req.query.status as string | undefined;
    const breed = req.query.breed as string | undefined;

    const batches = await storage.getChickenBatches({
      status,
      breed,
    });

    res.json(batches);
  });

  app.get("/api/chickens/:id", async (req, res) => {
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

  app.post("/api/chickens", validateBody(insertChickenBatchSchema), async (req, res) => {
    const batch = await storage.createChickenBatch(req.validatedBody);
    res.status(201).json(batch);
  });

  app.put("/api/chickens/:id", validateBody(insertChickenBatchSchema.partial()), async (req, res) => {
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

  app.delete("/api/chickens/:id", async (req, res) => {
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

  // Health records
  app.get("/api/health", async (req, res) => {
    const batchId = req.query.batchId as string | undefined;
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

    const records = await storage.getHealthRecords({
      batchId,
      startDate,
      endDate,
    });

    res.json(records);
  });

  app.get("/api/health/summary", async (req, res) => {
    const summary = await storage.getHealthSummary();
    res.json(summary);
  });

  app.get("/api/health/:id", async (req, res) => {
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

  app.post("/api/health", validateBody(insertHealthRecordSchema), async (req, res) => {
    const record = await storage.createHealthRecord(req.validatedBody);
    res.status(201).json(record);
  });

  app.put("/api/health/:id", validateBody(insertHealthRecordSchema.partial()), async (req, res) => {
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

  app.delete("/api/health/:id", async (req, res) => {
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

  // Maintenance tasks
  app.get("/api/tasks", async (req, res) => {
    const completed = req.query.completed ? req.query.completed === "true" : undefined;
    const category = req.query.category as string | undefined;
    const priority = req.query.priority as string | undefined;

    const tasks = await storage.getMaintenanceTasks({
      completed,
      category,
      priority,
    });

    res.json(tasks);
  });

  app.get("/api/tasks/:id", async (req, res) => {
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

  app.post("/api/tasks", validateBody(insertMaintenanceTaskSchema), async (req, res) => {
    const task = await storage.createMaintenanceTask(req.validatedBody);
    res.status(201).json(task);
  });

  app.put("/api/tasks/:id", validateBody(insertMaintenanceTaskSchema.partial()), async (req, res) => {
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

  app.post("/api/tasks/:id/toggle", async (req, res) => {
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

  app.delete("/api/tasks/:id", async (req, res) => {
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

  // Research notes
  app.get("/api/notes", async (req, res) => {
    const category = req.query.category as string | undefined;
    const tags = req.query.tags ? (req.query.tags as string).split(',') : undefined;
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

    const notes = await storage.getResearchNotes({
      category,
      tags,
      startDate,
      endDate,
    });

    res.json(notes);
  });

  app.get("/api/notes/:id", async (req, res) => {
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

  app.post("/api/notes", validateBody(insertResearchNoteSchema), async (req, res) => {
    const note = await storage.createResearchNote(req.validatedBody);
    res.status(201).json(note);
  });

  app.put("/api/notes/:id", validateBody(insertResearchNoteSchema.partial()), async (req, res) => {
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

  app.delete("/api/notes/:id", async (req, res) => {
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

  // Inventory
  app.get("/api/inventory", async (req, res) => {
    const category = req.query.category as string | undefined;
    const belowReorderLevel = req.query.belowReorderLevel === "true";

    const items = await storage.getInventoryItems({
      category,
      belowReorderLevel: belowReorderLevel || undefined,
    });

    res.json(items);
  });

  app.get("/api/inventory/:id", async (req, res) => {
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

  app.post("/api/inventory", validateBody(insertInventoryItemSchema), async (req, res) => {
    const item = await storage.createInventoryItem(req.validatedBody);
    res.status(201).json(item);
  });

  app.put("/api/inventory/:id", validateBody(insertInventoryItemSchema.partial()), async (req, res) => {
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

  app.post("/api/inventory/:id/adjust", async (req, res) => {
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

  app.delete("/api/inventory/:id", async (req, res) => {
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

  const httpServer = createServer(app);
  return httpServer;
}
