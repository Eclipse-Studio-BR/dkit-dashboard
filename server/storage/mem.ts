import { randomUUID } from "crypto";
import type {
  ApiKey,
  InsertApiKey,
  InsertProject,
  InsertUser,
  MetricPoint,
  Project,
  Transaction,
  User,
} from "./types.js";
import { IStorage } from "./types.js";

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private projects: Map<string, Project>;
  private metrics: Map<string, MetricPoint>;
  private transactions: Map<string, Transaction>;
  private apiKeys: Map<string, ApiKey>;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.metrics = new Map();
    this.transactions = new Map();
    this.apiKeys = new Map();

    this.seedMockData();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.email === email);
  }

  async createUser(insertUser: InsertUser, projectId: string): Promise<User> {
    const id = randomUUID();
    const now = new Date();
    const user: User = {
      id,
      name: insertUser.name,
      email: insertUser.email,
      password: insertUser.password,
      role: "PARTNER",
      projectId,
      googleId: null,
      avatarUrl: null,
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(id, user);
    return user;
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = randomUUID();
    const project: Project = {
      id,
      name: insertProject.name || null,
      logoUrl: insertProject.logoUrl || null,
      dappUrl: insertProject.dappUrl || null,
      btcAddress: insertProject.btcAddress || null,
      thorName: insertProject.thorName || null,
      mayaName: insertProject.mayaName || null,
      chainflipAddress: insertProject.chainflipAddress || null,
      setupCompleted: "false",
    };
    this.projects.set(id, project);
    this.seedProjectMetrics(id);
    this.seedProjectTransactions(id);
    return project;
  }

  async updateProject(id: string, updates: Partial<InsertProject> & { setupCompleted?: string }): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;

    const updated: Project = {
      ...project,
      name: updates.name !== undefined ? updates.name || null : project.name,
      logoUrl: updates.logoUrl !== undefined ? updates.logoUrl || null : project.logoUrl,
      dappUrl: updates.dappUrl !== undefined ? updates.dappUrl || null : project.dappUrl,
      btcAddress: updates.btcAddress !== undefined ? updates.btcAddress || null : project.btcAddress,
      thorName: updates.thorName !== undefined ? updates.thorName || null : project.thorName,
      mayaName: updates.mayaName !== undefined ? updates.mayaName || null : project.mayaName,
      chainflipAddress: updates.chainflipAddress !== undefined ? updates.chainflipAddress || null : project.chainflipAddress,
      setupCompleted: updates.setupCompleted !== undefined ? updates.setupCompleted : project.setupCompleted,
    };

    this.projects.set(id, updated);
    return updated;
  }

  async getMetrics(projectId: string, fromDate?: Date, toDate?: Date): Promise<MetricPoint[]> {
    // Keep demo metrics fresh so short timeframes always have data
    this.backfillMetrics(projectId);

    const allMetrics = Array.from(this.metrics.values()).filter((m) => m.projectId === projectId);

    if (!fromDate && !toDate) {
      return allMetrics.sort((a, b) => new Date(a.t).getTime() - new Date(b.t).getTime());
    }

    return allMetrics
      .filter((m) => {
        const time = new Date(m.t).getTime();
        const after = fromDate ? time >= fromDate.getTime() : true;
        const before = toDate ? time <= toDate.getTime() : true;
        return after && before;
      })
      .sort((a, b) => new Date(a.t).getTime() - new Date(b.t).getTime());
  }

  async getTransactions(projectId: string, limit = 25): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter((t) => t.projectId === projectId)
      .sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())
      .slice(0, limit);
  }

  async getApiKeys(projectId: string): Promise<ApiKey[]> {
    return Array.from(this.apiKeys.values())
      .filter((k) => k.projectId === projectId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createApiKey(projectId: string, name: string): Promise<ApiKey> {
    const id = randomUUID();
    const key = `dk_${randomUUID().replace(/-/g, "")}`;
    const apiKey: ApiKey = {
      id,
      projectId,
      name,
      key,
      status: "active",
      createdAt: new Date(),
    };
    this.apiKeys.set(id, apiKey);
    return apiKey;
  }

  async deleteApiKey(id: string, projectId: string): Promise<boolean> {
    const apiKey = this.apiKeys.get(id);
    if (!apiKey || apiKey.projectId !== projectId) {
      return false;
    }
    return this.apiKeys.delete(id);
  }

  private seedMockData() {
    // This will be called on initialization but won't create any data
    // Data will be created per project when projects are created
  }

  private seedProjectMetrics(projectId: string) {
    const now = new Date();
    const daysToGenerate = 30;

    for (let i = daysToGenerate - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      // Generate 24 hourly data points for each day
      for (let hour = 0; hour < 24; hour++) {
        const pointDate = new Date(date);
        pointDate.setHours(hour, 0, 0, 0);

        const baseVolume = 10000 + Math.random() * 15000;
        const baseFees = baseVolume * (0.003 + Math.random() * 0.002);
        const trades = Math.floor(20 + Math.random() * 40);

        const metric: MetricPoint = {
          id: randomUUID(),
          projectId,
          t: pointDate,
          volumeUsd: baseVolume,
          feesUsd: baseFees,
          trades,
        };

        this.metrics.set(metric.id, metric);
      }
    }
  }

  private backfillMetrics(projectId: string) {
    const projectMetrics = Array.from(this.metrics.values()).filter((m) => m.projectId === projectId);
    const now = new Date();
    const targetHour = new Date(now);
    targetHour.setMinutes(0, 0, 0);

    const lastPoint = projectMetrics.reduce<Date | undefined>((latest, current) => {
      if (!latest || current.t > latest) {
        return current.t;
      }
      return latest;
    }, undefined);

    let nextDate = lastPoint ? new Date(lastPoint) : new Date(targetHour);
    if (lastPoint) {
      nextDate.setHours(nextDate.getHours() + 1, 0, 0, 0);
    } else {
      nextDate.setDate(nextDate.getDate() - 30);
      nextDate.setHours(0, 0, 0, 0);
    }

    while (nextDate <= targetHour) {
      const baseVolume = 10000 + Math.random() * 15000;
      const baseFees = baseVolume * (0.003 + Math.random() * 0.002);
      const trades = Math.floor(20 + Math.random() * 40);

      const metric: MetricPoint = {
        id: randomUUID(),
        projectId,
        t: new Date(nextDate),
        volumeUsd: baseVolume,
        feesUsd: baseFees,
        trades,
      };

      this.metrics.set(metric.id, metric);
      nextDate.setHours(nextDate.getHours() + 1);
    }
  }

  private seedProjectTransactions(projectId: string) {
    const swapPairs = [
      { from: "BTC", to: "ETH", route: "BTC→ETH" },
      { from: "ETH", to: "USDC", route: "ETH→USDC" },
      { from: "USDC", to: "BTC", route: "USDC→BTC" },
      { from: "ETH", to: "BTC", route: "ETH→BTC" },
      { from: "BTC", to: "USDT", route: "BTC→USDT" },
      { from: "SOL", to: "ETH", route: "SOL→ETH" },
      { from: "RUNE", to: "BTC", route: "RUNE→BTC" },
    ];
    const chains = ["THOR", "MAYA", "CHAINFLIP"];
    const statuses = ["Completed", "Running", "Refunded"];

    const transactionCount = 8 + Math.floor(Math.random() * 4);

    for (let i = 0; i < transactionCount; i++) {
      const hoursAgo = i * 2 + Math.random() * 2;
      const ts = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);

      const pair = swapPairs[Math.floor(Math.random() * swapPairs.length)];
      const chain = chains[Math.floor(Math.random() * chains.length)];
      const status = i === 0 ? "Running" : i === 1 ? "Refunded" : statuses[Math.floor(Math.random() * statuses.length)];

      const usdNotional = 1000 + Math.random() * 5000;
      const feeUsd = usdNotional * 0.003;

      // Generate realistic amounts
      const amountIn = (Math.random() * 5 + 0.1).toFixed(4);
      const amountOut = (parseFloat(amountIn) * (0.95 + Math.random() * 0.04)).toFixed(4);

      const transaction: Transaction = {
        id: randomUUID(),
        projectId,
        ts,
        assetFrom: pair.from,
        assetTo: pair.to,
        amountIn: `${amountIn} ${pair.from}`,
        amountOut: `${amountOut} ${pair.to}`,
        route: pair.route,
        usdNotional,
        feeUsd,
        status,
        txHash: `0x${randomUUID().replace(/-/g, "")}`,
        chain,
      };

      this.transactions.set(transaction.id, transaction);
    }
  }
}
