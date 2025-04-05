import { eq, desc, and, lte, gte, count, sum, countDistinct, lt, isNotNull, SQL } from 'drizzle-orm';
import { db } from './db';
import { 
  users, insertUserSchema, User, InsertUser,
  financialEntries, insertFinancialEntrySchema, FinancialEntry, InsertFinancialEntry,
  productionRecords, insertProductionRecordSchema, ProductionRecord, InsertProductionRecord,
  chickenBatches, insertChickenBatchSchema, ChickenBatch, InsertChickenBatch,
  healthRecords, insertHealthRecordSchema, HealthRecord, InsertHealthRecord,
  maintenanceTasks, insertMaintenanceTaskSchema, MaintenanceTask, InsertMaintenanceTask,
  researchNotes, insertResearchNoteSchema, ResearchNote, InsertResearchNote,
  inventoryItems, insertInventoryItemSchema, InventoryItem, InsertInventoryItem
} from '@shared/schema';
import { IStorage } from './storage';

export class DbStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.id, id));
    return results[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.username, username));
    return results[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const results = await db.insert(users).values(user).returning();
    return results[0];
  }

  // Financial operations
  async createFinancialEntry(entry: InsertFinancialEntry): Promise<FinancialEntry> {
    const results = await db.insert(financialEntries).values(entry).returning();
    return results[0];
  }

  async getFinancialEntries(
    filters?: { type?: string; category?: string; startDate?: Date; endDate?: Date }
  ): Promise<FinancialEntry[]> {
    const conditions: SQL<unknown>[] = [];

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

    return conditions.length > 0
      ? await db.select().from(financialEntries).where(and(...conditions)).orderBy(desc(financialEntries.date))
      : await db.select().from(financialEntries).orderBy(desc(financialEntries.date));
  }

  async getFinancialEntryById(id: number): Promise<FinancialEntry | undefined> {
    const results = await db.select().from(financialEntries).where(eq(financialEntries.id, id));
    return results[0];
  }

  async updateFinancialEntry(id: number, entry: Partial<InsertFinancialEntry>): Promise<FinancialEntry | undefined> {
    const results = await db.update(financialEntries).set(entry).where(eq(financialEntries.id, id)).returning();
    return results[0];
  }

  async deleteFinancialEntry(id: number): Promise<boolean> {
    const results = await db.delete(financialEntries).where(eq(financialEntries.id, id)).returning({ id: financialEntries.id });
    return results.length > 0;
  }

  async getFinancialSummary(): Promise<{
    totalCapital: number;
    totalInvestments: number;
    totalIncome: number;
    totalExpenses: number;
    expensesByCategory: Record<string, number>;
  }> {
    // Get all financial entries
    const entries = await db.select().from(financialEntries);
    
    // Calculate totals
    const totalCapital = entries
      .filter(entry => entry.type === 'capital')
      .reduce((sum, entry) => sum + entry.amount, 0);
    
    const totalInvestments = entries
      .filter(entry => entry.type === 'investment')
      .reduce((sum, entry) => sum + entry.amount, 0);
    
    const totalIncome = entries
      .filter(entry => entry.type === 'income')
      .reduce((sum, entry) => sum + entry.amount, 0);
    
    const totalExpenses = entries
      .filter(entry => entry.type === 'expense')
      .reduce((sum, entry) => sum + entry.amount, 0);
    
    // Calculate expenses by category
    const expensesByCategory: Record<string, number> = {};
    entries
      .filter(entry => entry.type === 'expense')
      .forEach(entry => {
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
  async createProductionRecord(record: InsertProductionRecord): Promise<ProductionRecord> {
    const results = await db.insert(productionRecords).values(record).returning();
    return results[0];
  }

  async getProductionRecords(
    filters?: { startDate?: Date; endDate?: Date; batchId?: string }
  ): Promise<ProductionRecord[]> {
    const conditions: SQL<unknown>[] = [];

    if (filters?.batchId) {
      conditions.push(eq(productionRecords.batchId, filters.batchId));
    }
    if (filters?.startDate) {
      conditions.push(gte(productionRecords.date, filters.startDate));
    }
    if (filters?.endDate) {
      conditions.push(lte(productionRecords.date, filters.endDate));
    }

    return conditions.length > 0
      ? await db.select().from(productionRecords).where(and(...conditions)).orderBy(desc(productionRecords.date))
      : await db.select().from(productionRecords).orderBy(desc(productionRecords.date));
  }

  async getProductionRecordById(id: number): Promise<ProductionRecord | undefined> {
    const results = await db.select().from(productionRecords).where(eq(productionRecords.id, id));
    return results[0];
  }

  async updateProductionRecord(id: number, record: Partial<InsertProductionRecord>): Promise<ProductionRecord | undefined> {
    const results = await db.update(productionRecords).set(record).where(eq(productionRecords.id, id)).returning();
    return results[0];
  }

  async deleteProductionRecord(id: number): Promise<boolean> {
    const results = await db.delete(productionRecords).where(eq(productionRecords.id, id)).returning({ id: productionRecords.id });
    return results.length > 0;
  }

  async getProductionSummary(days = 30): Promise<{
    totalEggs: number;
    gradeAPercentage: number;
    gradeBPercentage: number;
    brokenPercentage: number;
    dailyAverage: number;
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const records = await db.select()
      .from(productionRecords)
      .where(gte(productionRecords.date, startDate));
    
    if (records.length === 0) {
      return {
        totalEggs: 0,
        gradeAPercentage: 0,
        gradeBPercentage: 0,
        brokenPercentage: 0,
        dailyAverage: 0
      };
    }
    
    const totalEggs = records.reduce((sum, record) => sum + record.eggCount, 0);
    const totalGradeA = records.reduce((sum, record) => sum + (record.gradeA || 0), 0);
    const totalGradeB = records.reduce((sum, record) => sum + (record.gradeB || 0), 0);
    const totalBroken = records.reduce((sum, record) => sum + (record.broken || 0), 0);
    
    const gradeAPercentage = totalEggs > 0 ? Math.round((totalGradeA / totalEggs) * 100) : 0;
    const gradeBPercentage = totalEggs > 0 ? Math.round((totalGradeB / totalEggs) * 100) : 0;
    const brokenPercentage = totalEggs > 0 ? Math.round((totalBroken / totalEggs) * 100) : 0;
    
    // Calculate daily average
    const uniqueDays = new Set(records.map(record => record.date.toDateString())).size;
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
  async createChickenBatch(batch: InsertChickenBatch): Promise<ChickenBatch> {
    const results = await db.insert(chickenBatches).values(batch).returning();
    return results[0];
  }

  async getChickenBatches(filters?: { status?: string; breed?: string }): Promise<ChickenBatch[]> {
    const conditions: SQL<unknown>[] = [];

    if (filters?.status) {
      conditions.push(eq(chickenBatches.status, filters.status));
    }
    if (filters?.breed) {
      conditions.push(eq(chickenBatches.breed, filters.breed));
    }

    return conditions.length > 0
      ? await db.select().from(chickenBatches).where(and(...conditions))
      : await db.select().from(chickenBatches);
  }

  async getChickenBatchById(id: number): Promise<ChickenBatch | undefined> {
    const results = await db.select().from(chickenBatches).where(eq(chickenBatches.id, id));
    return results[0];
  }

  async getChickenBatchByBatchId(batchId: string): Promise<ChickenBatch | undefined> {
    const results = await db.select().from(chickenBatches).where(eq(chickenBatches.batchId, batchId));
    return results[0];
  }

  async updateChickenBatch(id: number, batch: Partial<InsertChickenBatch>): Promise<ChickenBatch | undefined> {
    const results = await db.update(chickenBatches).set(batch).where(eq(chickenBatches.id, id)).returning();
    return results[0];
  }

  async deleteChickenBatch(id: number): Promise<boolean> {
    const results = await db.delete(chickenBatches).where(eq(chickenBatches.id, id)).returning({ id: chickenBatches.id });
    return results.length > 0;
  }

  // Health records operations
  async createHealthRecord(record: InsertHealthRecord): Promise<HealthRecord> {
    const results = await db.insert(healthRecords).values(record).returning();
    return results[0];
  }

  async getHealthRecords(
    filters?: { batchId?: string; startDate?: Date; endDate?: Date }
  ): Promise<HealthRecord[]> {
    const conditions: SQL<unknown>[] = [];

    if (filters?.batchId) {
      conditions.push(eq(healthRecords.batchId, filters.batchId));
    }
    if (filters?.startDate) {
      conditions.push(gte(healthRecords.date, filters.startDate));
    }
    if (filters?.endDate) {
      conditions.push(lte(healthRecords.date, filters.endDate));
    }

    return conditions.length > 0
      ? await db.select().from(healthRecords).where(and(...conditions)).orderBy(desc(healthRecords.date))
      : await db.select().from(healthRecords).orderBy(desc(healthRecords.date));
  }

  async getHealthRecordById(id: number): Promise<HealthRecord | undefined> {
    const results = await db.select().from(healthRecords).where(eq(healthRecords.id, id));
    return results[0];
  }

  async updateHealthRecord(id: number, record: Partial<InsertHealthRecord>): Promise<HealthRecord | undefined> {
    const results = await db.update(healthRecords).set(record).where(eq(healthRecords.id, id)).returning();
    return results[0];
  }

  async deleteHealthRecord(id: number): Promise<boolean> {
    const results = await db.delete(healthRecords).where(eq(healthRecords.id, id)).returning({ id: healthRecords.id });
    return results.length > 0;
  }

  async getHealthSummary(): Promise<{
    totalMortality: number;
    healthyPercentage: number;
    commonSymptoms: string[];
  }> {
    // Get all health records
    const records = await db.select().from(healthRecords);
    const batches = await db.select().from(chickenBatches);
    
    // Calculate total mortality
    const totalMortality = records.reduce((sum, record) => sum + (record.mortalityCount || 0), 0);
    
    // Calculate healthy percentage
    const totalChickens = batches.reduce((sum, batch) => sum + batch.quantity, 0);
    const healthyPercentage = totalChickens > 0 
      ? Math.round(((totalChickens - totalMortality) / totalChickens) * 100) 
      : 100;
    
    // Find common symptoms
    const symptomsMap = new Map<string, number>();
    
    records.forEach(record => {
      if (record.symptoms) {
        record.symptoms.forEach(symptom => {
          symptomsMap.set(symptom, (symptomsMap.get(symptom) || 0) + 1);
        });
      }
    });
    
    // Sort symptoms by frequency
    const sortedSymptoms = Array.from(symptomsMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0])
      .slice(0, 5);
    
    return {
      totalMortality,
      healthyPercentage,
      commonSymptoms: sortedSymptoms
    };
  }

  // Maintenance tasks operations
  async createMaintenanceTask(task: InsertMaintenanceTask): Promise<MaintenanceTask> {
    const results = await db.insert(maintenanceTasks).values({
      ...task,
      completed: task.completed ?? false
    }).returning();
    return results[0];
  }

  async getMaintenanceTasks(
    filters?: { completed?: boolean; category?: string; priority?: string }
  ): Promise<MaintenanceTask[]> {
    const conditions: SQL<unknown>[] = [];

    if (filters?.completed !== undefined) {
      conditions.push(eq(maintenanceTasks.completed, filters.completed));
    }
    if (filters?.category) {
      conditions.push(eq(maintenanceTasks.category, filters.category));
    }
    if (filters?.priority) {
      conditions.push(eq(maintenanceTasks.priority, filters.priority));
    }

    return conditions.length > 0
      ? await db.select().from(maintenanceTasks).where(and(...conditions))
      : await db.select().from(maintenanceTasks);
  }

  async getMaintenanceTaskById(id: number): Promise<MaintenanceTask | undefined> {
    const results = await db.select().from(maintenanceTasks).where(eq(maintenanceTasks.id, id));
    return results[0];
  }

  async updateMaintenanceTask(id: number, task: Partial<InsertMaintenanceTask>): Promise<MaintenanceTask | undefined> {
    const results = await db.update(maintenanceTasks).set(task).where(eq(maintenanceTasks.id, id)).returning();
    return results[0];
  }

  async deleteMaintenanceTask(id: number): Promise<boolean> {
    const results = await db.delete(maintenanceTasks).where(eq(maintenanceTasks.id, id)).returning({ id: maintenanceTasks.id });
    return results.length > 0;
  }

  async toggleTaskCompletion(id: number): Promise<MaintenanceTask | undefined> {
    const task = await this.getMaintenanceTaskById(id);
    if (!task) return undefined;
    
    const results = await db.update(maintenanceTasks)
      .set({ completed: !task.completed })
      .where(eq(maintenanceTasks.id, id))
      .returning();
    
    return results[0];
  }

  // Research notes operations
  async createResearchNote(note: InsertResearchNote): Promise<ResearchNote> {
    const results = await db.insert(researchNotes).values(note).returning();
    return results[0];
  }

  async getResearchNotes(
    filters?: { category?: string; tags?: string[]; startDate?: Date; endDate?: Date }
  ): Promise<ResearchNote[]> {
    const conditions: SQL<unknown>[] = [];

    if (filters?.category) {
      conditions.push(eq(researchNotes.category, filters.category));
    }
    // We can't filter by tags directly with SQL, we'll filter after fetching
    if (filters?.startDate) {
      conditions.push(gte(researchNotes.date, filters.startDate));
    }
    if (filters?.endDate) {
      conditions.push(lte(researchNotes.date, filters.endDate));
    }

    let notes = conditions.length > 0
      ? await db.select().from(researchNotes).where(and(...conditions)).orderBy(desc(researchNotes.date))
      : await db.select().from(researchNotes).orderBy(desc(researchNotes.date));
    
    // Filter by tags if provided
    if (filters?.tags && filters.tags.length > 0) {
      notes = notes.filter(note => {
        if (!note.tags) return false;
        return filters.tags!.some(tag => note.tags!.includes(tag));
      });
    }
    
    return notes;
  }

  async getResearchNoteById(id: number): Promise<ResearchNote | undefined> {
    const results = await db.select().from(researchNotes).where(eq(researchNotes.id, id));
    return results[0];
  }

  async updateResearchNote(id: number, note: Partial<InsertResearchNote>): Promise<ResearchNote | undefined> {
    const results = await db.update(researchNotes).set(note).where(eq(researchNotes.id, id)).returning();
    return results[0];
  }

  async deleteResearchNote(id: number): Promise<boolean> {
    const results = await db.delete(researchNotes).where(eq(researchNotes.id, id)).returning({ id: researchNotes.id });
    return results.length > 0;
  }

  // Inventory operations
  async createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem> {
    const results = await db.insert(inventoryItems).values({
      ...item,
      lastUpdated: new Date()
    }).returning();
    return results[0];
  }

  async getInventoryItems(
    filters?: { category?: string; belowReorderLevel?: boolean }
  ): Promise<InventoryItem[]> {
    const conditions: SQL<unknown>[] = [];

    if (filters?.category) {
      conditions.push(eq(inventoryItems.category, filters.category));
    }

    let items = conditions.length > 0
      ? await db.select().from(inventoryItems).where(and(...conditions))
      : await db.select().from(inventoryItems);
    
    // Filter for items below reorder level
    if (filters?.belowReorderLevel) {
      items = items.filter(item => 
        item.reorderLevel !== null && item.quantity <= item.reorderLevel
      );
    }
    
    return items;
  }

  async getInventoryItemById(id: number): Promise<InventoryItem | undefined> {
    const results = await db.select().from(inventoryItems).where(eq(inventoryItems.id, id));
    return results[0];
  }

  async updateInventoryItem(id: number, item: Partial<InsertInventoryItem>): Promise<InventoryItem | undefined> {
    const updatedItem = {
      ...item,
      lastUpdated: new Date()
    };
    
    const results = await db.update(inventoryItems).set(updatedItem).where(eq(inventoryItems.id, id)).returning();
    return results[0];
  }

  async deleteInventoryItem(id: number): Promise<boolean> {
    const results = await db.delete(inventoryItems).where(eq(inventoryItems.id, id)).returning({ id: inventoryItems.id });
    return results.length > 0;
  }

  async updateInventoryQuantity(id: number, adjustment: number): Promise<InventoryItem | undefined> {
    const item = await this.getInventoryItemById(id);
    if (!item) return undefined;
    
    const newQuantity = item.quantity + adjustment;
    if (newQuantity < 0) return undefined; // Prevent negative quantities
    
    const results = await db.update(inventoryItems)
      .set({ 
        quantity: newQuantity,
        lastUpdated: new Date()
      })
      .where(eq(inventoryItems.id, id))
      .returning();
    
    return results[0];
  }
}