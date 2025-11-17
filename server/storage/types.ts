import type {
  User,
  InsertUser,
  Project,
  InsertProject,
  MetricPoint,
  Transaction,
  ApiKey,
  InsertApiKey,
} from "../../shared/schema.js";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser, projectId: string): Promise<User>;

  // Project methods
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, updates: Partial<InsertProject> & { setupCompleted?: string }): Promise<Project | undefined>;

  // Metrics methods
  getMetrics(projectId: string, fromDate?: Date, toDate?: Date): Promise<MetricPoint[]>;

  // Transaction methods
  getTransactions(projectId: string, limit?: number): Promise<Transaction[]>;

  // API Key methods
  getApiKeys(projectId: string): Promise<ApiKey[]>;
  createApiKey(projectId: string, name: string): Promise<ApiKey>;
  deleteApiKey(id: string, projectId: string): Promise<boolean>;
}

export type {
  User,
  InsertUser,
  Project,
  InsertProject,
  MetricPoint,
  Transaction,
  ApiKey,
  InsertApiKey,
} from "../../shared/schema.js";
