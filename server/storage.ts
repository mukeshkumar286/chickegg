import {
  users, type User, type InsertUser,
  financialEntries, type FinancialEntry, type InsertFinancialEntry,
  productionRecords, type ProductionRecord, type InsertProductionRecord,
  chickenBatches, type ChickenBatch, type InsertChickenBatch,
  healthRecords, type HealthRecord, type InsertHealthRecord,
  maintenanceTasks, type MaintenanceTask, type InsertMaintenanceTask,
  researchNotes, type ResearchNote, type InsertResearchNote,
  inventoryItems, type InventoryItem, type InsertInventoryItem
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Financial operations
  createFinancialEntry(entry: InsertFinancialEntry): Promise<FinancialEntry>;
  getFinancialEntries(
    filters?: { type?: string; category?: string; startDate?: Date; endDate?: Date }
  ): Promise<FinancialEntry[]>;
  getFinancialEntryById(id: number): Promise<FinancialEntry | undefined>;
  updateFinancialEntry(id: number, entry: Partial<InsertFinancialEntry>): Promise<FinancialEntry | undefined>;
  deleteFinancialEntry(id: number): Promise<boolean>;
  getFinancialSummary(): Promise<{
    totalCapital: number;
    totalInvestments: number;
    totalIncome: number;
    totalExpenses: number;
    expensesByCategory: Record<string, number>;
  }>;

  // Production operations
  createProductionRecord(record: InsertProductionRecord): Promise<ProductionRecord>;
  getProductionRecords(
    filters?: { startDate?: Date; endDate?: Date; batchId?: string }
  ): Promise<ProductionRecord[]>;
  getProductionRecordById(id: number): Promise<ProductionRecord | undefined>;
  updateProductionRecord(id: number, record: Partial<InsertProductionRecord>): Promise<ProductionRecord | undefined>;
  deleteProductionRecord(id: number): Promise<boolean>;
  getProductionSummary(days?: number): Promise<{
    totalEggs: number;
    gradeAPercentage: number;
    gradeBPercentage: number;
    brokenPercentage: number;
    dailyAverage: number;
  }>;

  // Chicken batch operations
  createChickenBatch(batch: InsertChickenBatch): Promise<ChickenBatch>;
  getChickenBatches(filters?: { status?: string; breed?: string }): Promise<ChickenBatch[]>;
  getChickenBatchById(id: number): Promise<ChickenBatch | undefined>;
  getChickenBatchByBatchId(batchId: string): Promise<ChickenBatch | undefined>;
  updateChickenBatch(id: number, batch: Partial<InsertChickenBatch>): Promise<ChickenBatch | undefined>;
  deleteChickenBatch(id: number): Promise<boolean>;

  // Health records operations
  createHealthRecord(record: InsertHealthRecord): Promise<HealthRecord>;
  getHealthRecords(
    filters?: { batchId?: string; startDate?: Date; endDate?: Date }
  ): Promise<HealthRecord[]>;
  getHealthRecordById(id: number): Promise<HealthRecord | undefined>;
  updateHealthRecord(id: number, record: Partial<InsertHealthRecord>): Promise<HealthRecord | undefined>;
  deleteHealthRecord(id: number): Promise<boolean>;
  getHealthSummary(): Promise<{
    totalMortality: number;
    healthyPercentage: number;
    commonSymptoms: string[];
  }>;

  // Maintenance tasks operations
  createMaintenanceTask(task: InsertMaintenanceTask): Promise<MaintenanceTask>;
  getMaintenanceTasks(
    filters?: { completed?: boolean; category?: string; priority?: string }
  ): Promise<MaintenanceTask[]>;
  getMaintenanceTaskById(id: number): Promise<MaintenanceTask | undefined>;
  updateMaintenanceTask(id: number, task: Partial<InsertMaintenanceTask>): Promise<MaintenanceTask | undefined>;
  deleteMaintenanceTask(id: number): Promise<boolean>;
  toggleTaskCompletion(id: number): Promise<MaintenanceTask | undefined>;

  // Research notes operations
  createResearchNote(note: InsertResearchNote): Promise<ResearchNote>;
  getResearchNotes(
    filters?: { category?: string; tags?: string[]; startDate?: Date; endDate?: Date }
  ): Promise<ResearchNote[]>;
  getResearchNoteById(id: number): Promise<ResearchNote | undefined>;
  updateResearchNote(id: number, note: Partial<InsertResearchNote>): Promise<ResearchNote | undefined>;
  deleteResearchNote(id: number): Promise<boolean>;

  // Inventory operations
  createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem>;
  getInventoryItems(
    filters?: { category?: string; belowReorderLevel?: boolean }
  ): Promise<InventoryItem[]>;
  getInventoryItemById(id: number): Promise<InventoryItem | undefined>;
  updateInventoryItem(id: number, item: Partial<InsertInventoryItem>): Promise<InventoryItem | undefined>;
  deleteInventoryItem(id: number): Promise<boolean>;
  updateInventoryQuantity(id: number, adjustment: number): Promise<InventoryItem | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private financialEntries: Map<number, FinancialEntry>;
  private productionRecords: Map<number, ProductionRecord>;
  private chickenBatches: Map<number, ChickenBatch>;
  private healthRecords: Map<number, HealthRecord>;
  private maintenanceTasks: Map<number, MaintenanceTask>;
  private researchNotes: Map<number, ResearchNote>;
  private inventoryItems: Map<number, InventoryItem>;

  private userCurrentId: number;
  private financialEntryCurrentId: number;
  private productionRecordCurrentId: number;
  private chickenBatchCurrentId: number;
  private healthRecordCurrentId: number;
  private maintenanceTaskCurrentId: number;
  private researchNoteCurrentId: number;
  private inventoryItemCurrentId: number;

  constructor() {
    this.users = new Map();
    this.financialEntries = new Map();
    this.productionRecords = new Map();
    this.chickenBatches = new Map();
    this.healthRecords = new Map();
    this.maintenanceTasks = new Map();
    this.researchNotes = new Map();
    this.inventoryItems = new Map();

    this.userCurrentId = 1;
    this.financialEntryCurrentId = 1;
    this.productionRecordCurrentId = 1;
    this.chickenBatchCurrentId = 1;
    this.healthRecordCurrentId = 1;
    this.maintenanceTaskCurrentId = 1;
    this.researchNoteCurrentId = 1;
    this.inventoryItemCurrentId = 1;

    // Add some initial demo data
    this.initializeData();
  }

  private initializeData() {
    // Add some initial financial entries
    const financialData: InsertFinancialEntry[] = [
      {
        date: new Date(2023, 4, 1),
        amount: 100000,
        type: "capital",
        category: "initial_investment",
        description: "Initial farm capital",
      },
      {
        date: new Date(2023, 4, 5),
        amount: 24500,
        type: "investment",
        category: "equipment",
        description: "Coop construction and equipment",
      },
      {
        date: new Date(2023, 4, 10),
        amount: 5000,
        type: "expense",
        category: "feed",
        description: "Initial feed stock",
      },
      {
        date: new Date(2023, 4, 15),
        amount: 2800,
        type: "expense",
        category: "labor",
        description: "Farm hand salary",
      },
      {
        date: new Date(2023, 4, 20),
        amount: 1200,
        type: "expense",
        category: "utilities",
        description: "Electricity and water",
      },
      {
        date: new Date(2023, 4, 25),
        amount: 8500,
        type: "income",
        category: "egg_sales",
        description: "Egg sales for the week",
      },
    ];

    financialData.forEach(entry => {
      this.createFinancialEntry(entry);
    });

    // Add chicken batches
    const batchData: InsertChickenBatch[] = [
      {
        batchId: "B001",
        breed: "Rhode Island Red",
        quantity: 200,
        acquisitionDate: new Date(2023, 4, 2),
        status: "active",
        notes: "Healthy batch of layers",
      },
      {
        batchId: "B002",
        breed: "Leghorn",
        quantity: 150,
        acquisitionDate: new Date(2023, 4, 10),
        status: "active",
        notes: "White egg layers",
      },
    ];

    batchData.forEach(batch => {
      this.createChickenBatch(batch);
    });

    // Add production records
    const productionData: InsertProductionRecord[] = [
      {
        date: new Date(2023, 4, 15),
        eggCount: 280,
        gradeA: 240,
        gradeB: 30,
        broken: 10,
        batchId: "B001",
      },
      {
        date: new Date(2023, 4, 16),
        eggCount: 285,
        gradeA: 245,
        gradeB: 32,
        broken: 8,
        batchId: "B001",
      },
      {
        date: new Date(2023, 4, 17),
        eggCount: 290,
        gradeA: 250,
        gradeB: 28,
        broken: 12,
        batchId: "B001",
      },
      {
        date: new Date(2023, 4, 18),
        eggCount: 278,
        gradeA: 235,
        gradeB: 33,
        broken: 10,
        batchId: "B001",
      },
      {
        date: new Date(2023, 4, 19),
        eggCount: 292,
        gradeA: 255,
        gradeB: 27,
        broken: 10,
        batchId: "B001",
      },
    ];

    productionData.forEach(record => {
      this.createProductionRecord(record);
    });

    // Add health records
    const healthData: InsertHealthRecord[] = [
      {
        date: new Date(2023, 4, 12),
        batchId: "B001",
        mortalityCount: 2,
        symptoms: ["lethargy", "reduced_appetite"],
        diagnosis: "Mild respiratory infection",
        treatment: "Administered antibiotics in water",
      },
      {
        date: new Date(2023, 4, 16),
        batchId: "B002",
        mortalityCount: 1,
        symptoms: ["weight_loss"],
        diagnosis: "Unknown cause",
        treatment: "Increased vitamin supplements",
      },
    ];

    healthData.forEach(record => {
      this.createHealthRecord(record);
    });

    // Add maintenance tasks
    const taskData: InsertMaintenanceTask[] = [
      {
        title: "Coop cleaning - Building A",
        description: "Deep clean coop building A",
        dueDate: new Date(2023, 4, 19, 14, 0),
        completed: false,
        category: "cleaning",
        priority: "medium",
      },
      {
        title: "Vaccine administration",
        description: "Scheduled vaccines for batch B001",
        dueDate: new Date(2023, 4, 20, 9, 0),
        completed: false,
        category: "health",
        priority: "high",
      },
      {
        title: "Feed inventory check",
        description: "Verify feed stock levels and place orders if needed",
        dueDate: new Date(2023, 4, 22, 11, 0),
        completed: false,
        category: "inventory",
        priority: "medium",
      },
      {
        title: "Monthly financial review",
        description: "Review month-end financials and prepare reports",
        dueDate: new Date(2023, 4, 31, 13, 0),
        completed: false,
        category: "finance",
        priority: "medium",
      },
    ];

    taskData.forEach(task => {
      this.createMaintenanceTask(task);
    });

    // Add research notes
    const noteData: InsertResearchNote[] = [
      {
        title: "Feed Optimization Study",
        content: "Initial findings show 12% improvement in egg production when supplementing with calcium at 4.2% concentration ratio compared to the control group.",
        date: new Date(2023, 4, 15),
        tags: ["feed", "calcium", "production"],
        category: "feed",
      },
      {
        title: "Lighting Schedule Experiment",
        content: "Extended lighting hours (16L:8D) showed a 7% increase in laying frequency but noted potential stress indicators. Monitoring continues for long-term effects.",
        date: new Date(2023, 4, 12),
        tags: ["lighting", "production", "stress"],
        category: "environment",
      },
      {
        title: "Breed Comparison Analysis",
        content: "Rhode Island Reds showing 14% higher feed conversion efficiency than Leghorns, but Leghorns producing eggs with 6% higher shell strength on average.",
        date: new Date(2023, 4, 8),
        tags: ["breeds", "comparison", "efficiency"],
        category: "genetics",
      },
    ];

    noteData.forEach(note => {
      this.createResearchNote(note);
    });

    // Add inventory items
    const inventoryData: InsertInventoryItem[] = [
      {
        name: "Layer Feed",
        category: "feed",
        quantity: 1200,
        unit: "kg",
        reorderLevel: 500,
        lastUpdated: new Date(2023, 4, 10),
      },
      {
        name: "Calcium Supplement",
        category: "feed_supplement",
        quantity: 50,
        unit: "kg",
        reorderLevel: 20,
        lastUpdated: new Date(2023, 4, 10),
      },
      {
        name: "Egg Cartons",
        category: "packaging",
        quantity: 2000,
        unit: "pieces",
        reorderLevel: 500,
        lastUpdated: new Date(2023, 4, 12),
      },
      {
        name: "Multivitamins",
        category: "medicine",
        quantity: 5,
        unit: "liters",
        reorderLevel: 2,
        lastUpdated: new Date(2023, 4, 8),
      },
    ];

    inventoryData.forEach(item => {
      this.createInventoryItem(item);
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Financial operations
  async createFinancialEntry(entry: InsertFinancialEntry): Promise<FinancialEntry> {
    const id = this.financialEntryCurrentId++;
    const newEntry: FinancialEntry = { ...entry, id };
    this.financialEntries.set(id, newEntry);
    return newEntry;
  }

  async getFinancialEntries(
    filters?: { type?: string; category?: string; startDate?: Date; endDate?: Date }
  ): Promise<FinancialEntry[]> {
    let entries = Array.from(this.financialEntries.values());

    if (filters) {
      if (filters.type) {
        entries = entries.filter(entry => entry.type === filters.type);
      }
      if (filters.category) {
        entries = entries.filter(entry => entry.category === filters.category);
      }
      if (filters.startDate) {
        entries = entries.filter(entry => entry.date >= filters.startDate);
      }
      if (filters.endDate) {
        entries = entries.filter(entry => entry.date <= filters.endDate);
      }
    }

    return entries.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async getFinancialEntryById(id: number): Promise<FinancialEntry | undefined> {
    return this.financialEntries.get(id);
  }

  async updateFinancialEntry(id: number, updates: Partial<InsertFinancialEntry>): Promise<FinancialEntry | undefined> {
    const entry = this.financialEntries.get(id);
    if (!entry) return undefined;

    const updatedEntry = { ...entry, ...updates };
    this.financialEntries.set(id, updatedEntry);
    return updatedEntry;
  }

  async deleteFinancialEntry(id: number): Promise<boolean> {
    return this.financialEntries.delete(id);
  }

  async getFinancialSummary(): Promise<{
    totalCapital: number;
    totalInvestments: number;
    totalIncome: number;
    totalExpenses: number;
    expensesByCategory: Record<string, number>;
  }> {
    const entries = Array.from(this.financialEntries.values());
    
    const totalCapital = entries
      .filter(entry => entry.type === "capital")
      .reduce((sum, entry) => sum + entry.amount, 0);
    
    const totalInvestments = entries
      .filter(entry => entry.type === "investment")
      .reduce((sum, entry) => sum + entry.amount, 0);
    
    const totalIncome = entries
      .filter(entry => entry.type === "income")
      .reduce((sum, entry) => sum + entry.amount, 0);
    
    const expenses = entries.filter(entry => entry.type === "expense");
    const totalExpenses = expenses.reduce((sum, entry) => sum + entry.amount, 0);
    
    const expensesByCategory: Record<string, number> = {};
    expenses.forEach(expense => {
      expensesByCategory[expense.category] = (expensesByCategory[expense.category] || 0) + expense.amount;
    });

    return {
      totalCapital,
      totalInvestments,
      totalIncome,
      totalExpenses,
      expensesByCategory,
    };
  }

  // Production operations
  async createProductionRecord(record: InsertProductionRecord): Promise<ProductionRecord> {
    const id = this.productionRecordCurrentId++;
    const newRecord: ProductionRecord = { ...record, id };
    this.productionRecords.set(id, newRecord);
    return newRecord;
  }

  async getProductionRecords(
    filters?: { startDate?: Date; endDate?: Date; batchId?: string }
  ): Promise<ProductionRecord[]> {
    let records = Array.from(this.productionRecords.values());

    if (filters) {
      if (filters.batchId) {
        records = records.filter(record => record.batchId === filters.batchId);
      }
      if (filters.startDate) {
        records = records.filter(record => record.date >= filters.startDate);
      }
      if (filters.endDate) {
        records = records.filter(record => record.date <= filters.endDate);
      }
    }

    return records.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async getProductionRecordById(id: number): Promise<ProductionRecord | undefined> {
    return this.productionRecords.get(id);
  }

  async updateProductionRecord(id: number, updates: Partial<InsertProductionRecord>): Promise<ProductionRecord | undefined> {
    const record = this.productionRecords.get(id);
    if (!record) return undefined;

    const updatedRecord = { ...record, ...updates };
    this.productionRecords.set(id, updatedRecord);
    return updatedRecord;
  }

  async deleteProductionRecord(id: number): Promise<boolean> {
    return this.productionRecords.delete(id);
  }

  async getProductionSummary(days = 30): Promise<{
    totalEggs: number;
    gradeAPercentage: number;
    gradeBPercentage: number;
    brokenPercentage: number;
    dailyAverage: number;
  }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const records = Array.from(this.productionRecords.values())
      .filter(record => record.date >= cutoffDate);
    
    if (records.length === 0) {
      return {
        totalEggs: 0,
        gradeAPercentage: 0,
        gradeBPercentage: 0,
        brokenPercentage: 0,
        dailyAverage: 0,
      };
    }
    
    const totalEggs = records.reduce((sum, record) => sum + record.eggCount, 0);
    const totalGradeA = records.reduce((sum, record) => sum + (record.gradeA || 0), 0);
    const totalGradeB = records.reduce((sum, record) => sum + (record.gradeB || 0), 0);
    const totalBroken = records.reduce((sum, record) => sum + (record.broken || 0), 0);
    
    // Get unique dates to count number of days
    const uniqueDates = new Set(records.map(record => record.date.toDateString()));
    const numDays = uniqueDates.size || 1; // Avoid division by zero
    
    return {
      totalEggs,
      gradeAPercentage: Math.round((totalGradeA / totalEggs) * 100),
      gradeBPercentage: Math.round((totalGradeB / totalEggs) * 100),
      brokenPercentage: Math.round((totalBroken / totalEggs) * 100),
      dailyAverage: Math.round(totalEggs / numDays),
    };
  }

  // Chicken batch operations
  async createChickenBatch(batch: InsertChickenBatch): Promise<ChickenBatch> {
    const id = this.chickenBatchCurrentId++;
    const newBatch: ChickenBatch = { ...batch, id };
    this.chickenBatches.set(id, newBatch);
    return newBatch;
  }

  async getChickenBatches(filters?: { status?: string; breed?: string }): Promise<ChickenBatch[]> {
    let batches = Array.from(this.chickenBatches.values());

    if (filters) {
      if (filters.status) {
        batches = batches.filter(batch => batch.status === filters.status);
      }
      if (filters.breed) {
        batches = batches.filter(batch => batch.breed === filters.breed);
      }
    }

    return batches.sort((a, b) => b.acquisitionDate.getTime() - a.acquisitionDate.getTime());
  }

  async getChickenBatchById(id: number): Promise<ChickenBatch | undefined> {
    return this.chickenBatches.get(id);
  }

  async getChickenBatchByBatchId(batchId: string): Promise<ChickenBatch | undefined> {
    return Array.from(this.chickenBatches.values())
      .find(batch => batch.batchId === batchId);
  }

  async updateChickenBatch(id: number, updates: Partial<InsertChickenBatch>): Promise<ChickenBatch | undefined> {
    const batch = this.chickenBatches.get(id);
    if (!batch) return undefined;

    const updatedBatch = { ...batch, ...updates };
    this.chickenBatches.set(id, updatedBatch);
    return updatedBatch;
  }

  async deleteChickenBatch(id: number): Promise<boolean> {
    return this.chickenBatches.delete(id);
  }

  // Health records operations
  async createHealthRecord(record: InsertHealthRecord): Promise<HealthRecord> {
    const id = this.healthRecordCurrentId++;
    const newRecord: HealthRecord = { ...record, id };
    this.healthRecords.set(id, newRecord);
    return newRecord;
  }

  async getHealthRecords(
    filters?: { batchId?: string; startDate?: Date; endDate?: Date }
  ): Promise<HealthRecord[]> {
    let records = Array.from(this.healthRecords.values());

    if (filters) {
      if (filters.batchId) {
        records = records.filter(record => record.batchId === filters.batchId);
      }
      if (filters.startDate) {
        records = records.filter(record => record.date >= filters.startDate);
      }
      if (filters.endDate) {
        records = records.filter(record => record.date <= filters.endDate);
      }
    }

    return records.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async getHealthRecordById(id: number): Promise<HealthRecord | undefined> {
    return this.healthRecords.get(id);
  }

  async updateHealthRecord(id: number, updates: Partial<InsertHealthRecord>): Promise<HealthRecord | undefined> {
    const record = this.healthRecords.get(id);
    if (!record) return undefined;

    const updatedRecord = { ...record, ...updates };
    this.healthRecords.set(id, updatedRecord);
    return updatedRecord;
  }

  async deleteHealthRecord(id: number): Promise<boolean> {
    return this.healthRecords.delete(id);
  }

  async getHealthSummary(): Promise<{
    totalMortality: number;
    healthyPercentage: number;
    commonSymptoms: string[];
  }> {
    const records = Array.from(this.healthRecords.values());
    const batches = Array.from(this.chickenBatches.values());
    
    const totalMortality = records.reduce((sum, record) => sum + (record.mortalityCount || 0), 0);
    
    // Calculate total active chickens
    const totalChickens = batches
      .filter(batch => batch.status === "active")
      .reduce((sum, batch) => sum + batch.quantity, 0);
    
    // Flatten all symptoms and count occurrences
    const allSymptoms = records.flatMap(record => record.symptoms || []);
    const symptomCount: Record<string, number> = {};
    
    allSymptoms.forEach(symptom => {
      symptomCount[symptom] = (symptomCount[symptom] || 0) + 1;
    });
    
    // Sort symptoms by count and take top 5
    const commonSymptoms = Object.entries(symptomCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([symptom]) => symptom);
    
    const healthyPercentage = totalChickens > 0 
      ? Math.round(((totalChickens - totalMortality) / totalChickens) * 100) 
      : 100;
    
    return {
      totalMortality,
      healthyPercentage,
      commonSymptoms,
    };
  }

  // Maintenance tasks operations
  async createMaintenanceTask(task: InsertMaintenanceTask): Promise<MaintenanceTask> {
    const id = this.maintenanceTaskCurrentId++;
    const newTask: MaintenanceTask = { ...task, id };
    this.maintenanceTasks.set(id, newTask);
    return newTask;
  }

  async getMaintenanceTasks(
    filters?: { completed?: boolean; category?: string; priority?: string }
  ): Promise<MaintenanceTask[]> {
    let tasks = Array.from(this.maintenanceTasks.values());

    if (filters) {
      if (filters.completed !== undefined) {
        tasks = tasks.filter(task => task.completed === filters.completed);
      }
      if (filters.category) {
        tasks = tasks.filter(task => task.category === filters.category);
      }
      if (filters.priority) {
        tasks = tasks.filter(task => task.priority === filters.priority);
      }
    }

    // Sort by due date (closest first) then by priority
    return tasks.sort((a, b) => {
      // If due dates exist, sort by them
      if (a.dueDate && b.dueDate) {
        return a.dueDate.getTime() - b.dueDate.getTime();
      }
      
      // If only one has due date, it comes first
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      
      // Otherwise sort by priority
      const priorityMap: Record<string, number> = { 
        high: 0, 
        medium: 1, 
        low: 2 
      };
      
      return priorityMap[a.priority || 'medium'] - priorityMap[b.priority || 'medium'];
    });
  }

  async getMaintenanceTaskById(id: number): Promise<MaintenanceTask | undefined> {
    return this.maintenanceTasks.get(id);
  }

  async updateMaintenanceTask(id: number, updates: Partial<InsertMaintenanceTask>): Promise<MaintenanceTask | undefined> {
    const task = this.maintenanceTasks.get(id);
    if (!task) return undefined;

    const updatedTask = { ...task, ...updates };
    this.maintenanceTasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteMaintenanceTask(id: number): Promise<boolean> {
    return this.maintenanceTasks.delete(id);
  }

  async toggleTaskCompletion(id: number): Promise<MaintenanceTask | undefined> {
    const task = this.maintenanceTasks.get(id);
    if (!task) return undefined;

    const updatedTask = { ...task, completed: !task.completed };
    this.maintenanceTasks.set(id, updatedTask);
    return updatedTask;
  }

  // Research notes operations
  async createResearchNote(note: InsertResearchNote): Promise<ResearchNote> {
    const id = this.researchNoteCurrentId++;
    const newNote: ResearchNote = { ...note, id };
    this.researchNotes.set(id, newNote);
    return newNote;
  }

  async getResearchNotes(
    filters?: { category?: string; tags?: string[]; startDate?: Date; endDate?: Date }
  ): Promise<ResearchNote[]> {
    let notes = Array.from(this.researchNotes.values());

    if (filters) {
      if (filters.category) {
        notes = notes.filter(note => note.category === filters.category);
      }
      if (filters.tags && filters.tags.length > 0) {
        notes = notes.filter(note => {
          return note.tags && filters.tags?.some(tag => note.tags.includes(tag));
        });
      }
      if (filters.startDate) {
        notes = notes.filter(note => note.date >= filters.startDate);
      }
      if (filters.endDate) {
        notes = notes.filter(note => note.date <= filters.endDate);
      }
    }

    return notes.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async getResearchNoteById(id: number): Promise<ResearchNote | undefined> {
    return this.researchNotes.get(id);
  }

  async updateResearchNote(id: number, updates: Partial<InsertResearchNote>): Promise<ResearchNote | undefined> {
    const note = this.researchNotes.get(id);
    if (!note) return undefined;

    const updatedNote = { ...note, ...updates };
    this.researchNotes.set(id, updatedNote);
    return updatedNote;
  }

  async deleteResearchNote(id: number): Promise<boolean> {
    return this.researchNotes.delete(id);
  }

  // Inventory operations
  async createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem> {
    const id = this.inventoryItemCurrentId++;
    const newItem: InventoryItem = { ...item, id };
    this.inventoryItems.set(id, newItem);
    return newItem;
  }

  async getInventoryItems(
    filters?: { category?: string; belowReorderLevel?: boolean }
  ): Promise<InventoryItem[]> {
    let items = Array.from(this.inventoryItems.values());

    if (filters) {
      if (filters.category) {
        items = items.filter(item => item.category === filters.category);
      }
      if (filters.belowReorderLevel) {
        items = items.filter(item => 
          item.reorderLevel !== undefined && item.quantity <= item.reorderLevel
        );
      }
    }

    return items.sort((a, b) => a.name.localeCompare(b.name));
  }

  async getInventoryItemById(id: number): Promise<InventoryItem | undefined> {
    return this.inventoryItems.get(id);
  }

  async updateInventoryItem(id: number, updates: Partial<InsertInventoryItem>): Promise<InventoryItem | undefined> {
    const item = this.inventoryItems.get(id);
    if (!item) return undefined;

    const updatedItem = { ...item, ...updates, lastUpdated: new Date() };
    this.inventoryItems.set(id, updatedItem);
    return updatedItem;
  }

  async deleteInventoryItem(id: number): Promise<boolean> {
    return this.inventoryItems.delete(id);
  }

  async updateInventoryQuantity(id: number, adjustment: number): Promise<InventoryItem | undefined> {
    const item = this.inventoryItems.get(id);
    if (!item) return undefined;

    const updatedItem = { 
      ...item, 
      quantity: item.quantity + adjustment,
      lastUpdated: new Date()
    };
    
    this.inventoryItems.set(id, updatedItem);
    return updatedItem;
  }
}

// Exported storage classes and instances
import { DbStorage } from './db-storage';

// Use the database storage implementation by default
export let storage: IStorage = new DbStorage();

// Function to set the storage implementation
export function setStorage(newStorage: IStorage) {
  storage = newStorage;
}
