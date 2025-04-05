import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { runMigrations } from "./migration";
import { DbStorage } from "./db-storage";
import { storage, setStorage, IStorage } from "./storage";
import { setupAuth, createAdminUser } from "./auth";

// Import the types we need from the shared schema
import {
  User, InsertUser, 
  FinancialEntry, InsertFinancialEntry,
  ProductionRecord, InsertProductionRecord,
  ChickenBatch, InsertChickenBatch,
  HealthRecord, InsertHealthRecord,
  MaintenanceTask, InsertMaintenanceTask,
  ResearchNote, InsertResearchNote,
  InventoryItem, InsertInventoryItem
} from '@shared/schema';

// Simple implementation of IStorage for fallback
class FallbackStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> { 
    return undefined; 
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> { 
    return undefined; 
  }
  
  async createUser(user: InsertUser): Promise<User> { 
    // Return a mock user with the necessary fields
    return { 
      id: 1, 
      username: user.username,
      password: user.password
    }; 
  }
  
  // Financial operations
  async createFinancialEntry(entry: InsertFinancialEntry): Promise<FinancialEntry> { 
    return {
      id: 1,
      date: new Date(),
      type: entry.type,
      amount: entry.amount,
      category: entry.category,
      description: entry.description || null,
      tags: entry.tags || null
    };
  }
  
  async getFinancialEntries(): Promise<FinancialEntry[]> { 
    return []; 
  }
  
  async getFinancialEntryById(id: number): Promise<FinancialEntry | undefined> { 
    return undefined; 
  }
  
  async updateFinancialEntry(id: number, entry: Partial<InsertFinancialEntry>): Promise<FinancialEntry | undefined> { 
    return undefined; 
  }
  
  async deleteFinancialEntry(id: number): Promise<boolean> { 
    return false; 
  }
  
  async getFinancialSummary(): Promise<{
    totalCapital: number;
    totalInvestments: number;
    totalIncome: number;
    totalExpenses: number;
    expensesByCategory: Record<string, number>;
  }> { 
    return { 
      totalCapital: 0, 
      totalInvestments: 0, 
      totalIncome: 0, 
      totalExpenses: 0, 
      expensesByCategory: {} 
    }; 
  }
  
  // Production operations
  async createProductionRecord(record: InsertProductionRecord): Promise<ProductionRecord> { 
    return {
      id: 1,
      date: new Date(),
      eggCount: record.eggCount,
      gradeA: record.gradeA || null,
      gradeB: record.gradeB || null,
      broken: record.broken || null,
      notes: record.notes || null,
      batchId: record.batchId || null
    };
  }
  
  async getProductionRecords(): Promise<ProductionRecord[]> { 
    return []; 
  }
  
  async getProductionRecordById(id: number): Promise<ProductionRecord | undefined> { 
    return undefined; 
  }
  
  async updateProductionRecord(id: number, record: Partial<InsertProductionRecord>): Promise<ProductionRecord | undefined> { 
    return undefined; 
  }
  
  async deleteProductionRecord(id: number): Promise<boolean> { 
    return false; 
  }
  
  async getProductionSummary(): Promise<{
    totalEggs: number;
    gradeAPercentage: number;
    gradeBPercentage: number;
    brokenPercentage: number;
    dailyAverage: number;
  }> { 
    return { 
      totalEggs: 0, 
      gradeAPercentage: 0, 
      gradeBPercentage: 0, 
      brokenPercentage: 0, 
      dailyAverage: 0 
    }; 
  }
  
  // Chicken batch operations
  async createChickenBatch(batch: InsertChickenBatch): Promise<ChickenBatch> { 
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
  
  async getChickenBatches(): Promise<ChickenBatch[]> { 
    return []; 
  }
  
  async getChickenBatchById(id: number): Promise<ChickenBatch | undefined> { 
    return undefined; 
  }
  
  async getChickenBatchByBatchId(batchId: string): Promise<ChickenBatch | undefined> { 
    return undefined; 
  }
  
  async updateChickenBatch(id: number, batch: Partial<InsertChickenBatch>): Promise<ChickenBatch | undefined> { 
    return undefined; 
  }
  
  async deleteChickenBatch(id: number): Promise<boolean> { 
    return false; 
  }
  
  // Health records operations
  async createHealthRecord(record: InsertHealthRecord): Promise<HealthRecord> { 
    return {
      id: 1,
      date: new Date(),
      batchId: record.batchId,
      notes: record.notes || null,
      mortalityCount: record.mortalityCount || null,
      symptoms: record.symptoms || null,
      diagnosis: record.diagnosis || null,
      treatment: record.treatment || null
    };
  }
  
  async getHealthRecords(): Promise<HealthRecord[]> { 
    return []; 
  }
  
  async getHealthRecordById(id: number): Promise<HealthRecord | undefined> { 
    return undefined; 
  }
  
  async updateHealthRecord(id: number, record: Partial<InsertHealthRecord>): Promise<HealthRecord | undefined> { 
    return undefined; 
  }
  
  async deleteHealthRecord(id: number): Promise<boolean> { 
    return false; 
  }
  
  async getHealthSummary(): Promise<{
    totalMortality: number;
    healthyPercentage: number;
    commonSymptoms: string[];
  }> { 
    return { 
      totalMortality: 0, 
      healthyPercentage: 0, 
      commonSymptoms: [] 
    }; 
  }
  
  // Maintenance tasks operations
  async createMaintenanceTask(task: InsertMaintenanceTask): Promise<MaintenanceTask> { 
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
  
  async getMaintenanceTasks(): Promise<MaintenanceTask[]> { 
    return []; 
  }
  
  async getMaintenanceTaskById(id: number): Promise<MaintenanceTask | undefined> { 
    return undefined; 
  }
  
  async updateMaintenanceTask(id: number, task: Partial<InsertMaintenanceTask>): Promise<MaintenanceTask | undefined> { 
    return undefined; 
  }
  
  async deleteMaintenanceTask(id: number): Promise<boolean> { 
    return false; 
  }
  
  async toggleTaskCompletion(id: number): Promise<MaintenanceTask | undefined> { 
    return undefined; 
  }
  
  // Research notes operations
  async createResearchNote(note: InsertResearchNote): Promise<ResearchNote> { 
    return {
      id: 1,
      date: new Date(),
      category: note.category,
      title: note.title,
      content: note.content,
      tags: note.tags || null
    };
  }
  
  async getResearchNotes(): Promise<ResearchNote[]> { 
    return []; 
  }
  
  async getResearchNoteById(id: number): Promise<ResearchNote | undefined> { 
    return undefined; 
  }
  
  async updateResearchNote(id: number, note: Partial<InsertResearchNote>): Promise<ResearchNote | undefined> { 
    return undefined; 
  }
  
  async deleteResearchNote(id: number): Promise<boolean> { 
    return false; 
  }
  
  // Inventory operations
  async createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem> { 
    return {
      id: 1,
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      notes: item.notes || null,
      reorderLevel: item.reorderLevel || null,
      lastUpdated: item.lastUpdated || new Date()
    };
  }
  
  async getInventoryItems(): Promise<InventoryItem[]> { 
    return []; 
  }
  
  async getInventoryItemById(id: number): Promise<InventoryItem | undefined> { 
    return undefined; 
  }
  
  async updateInventoryItem(id: number, item: Partial<InsertInventoryItem>): Promise<InventoryItem | undefined> { 
    return undefined; 
  }
  
  async deleteInventoryItem(id: number): Promise<boolean> { 
    return false; 
  }
  
  async updateInventoryQuantity(id: number, adjustment: number): Promise<InventoryItem | undefined> { 
    return undefined; 
  }
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // Run database migrations
    await runMigrations();
    
    // Initialize database storage
    const dbStorage = new DbStorage();
    setStorage(dbStorage);
    
    log("Database initialized successfully");
    
    // Set up authentication
    setupAuth(app);
    
    // Create admin user if it doesn't exist
    await createAdminUser();
  } catch (error) {
    console.error("Database initialization error:", error);
    log("Error initializing database, falling back to simple storage", "error");
    // Use the fallback storage implementation
    const fallbackStorage = new FallbackStorage();
    setStorage(fallbackStorage);
  }

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Use the PORT environment variable if it's set (for AWS), otherwise default to 5000
  // this serves both the API and the client
  const port = process.env.PORT || 5000;
  server.listen({
    port: Number(port),
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
