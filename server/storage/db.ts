import { randomUUID } from "crypto";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import {
  apiKeys,
  metricPoints,
  projects,
  transactions,
  users,
} from "../../shared/schema.js";
import type {
  ApiKey,
  InsertProject,
  InsertUser,
  MetricPoint,
  Project,
  Transaction,
  User,
} from "./types.js";
import { IStorage } from "./types.js";

export class DbStorage implements IStorage {
  private db;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not set");
    }

    const sql = neon(process.env.DATABASE_URL);
    this.db = drizzle(sql);
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async createUser(insertUser: InsertUser, projectId: string): Promise<User> {
    const result = await this.db.insert(users).values({
      name: insertUser.name,
      email: insertUser.email,
      password: insertUser.password,
      role: "PARTNER",
      projectId,
    }).returning();
    return result[0];
  }

  async getProject(id: string): Promise<Project | undefined> {
    const result = await this.db.select().from(projects).where(eq(projects.id, id));
    return result[0];
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const result = await this.db.insert(projects).values({
      name: insertProject.name || null,
      logoUrl: insertProject.logoUrl || null,
      dappUrl: insertProject.dappUrl || null,
      btcAddress: insertProject.btcAddress || null,
      thorName: insertProject.thorName || null,
      mayaName: insertProject.mayaName || null,
      chainflipAddress: insertProject.chainflipAddress || null,
      setupCompleted: "false",
    }).returning();

    const project = result[0];

    await this.seedProjectMetrics(project.id);
    await this.seedProjectTransactions(project.id);

    return project;
  }

  async updateProject(id: string, updates: Partial<InsertProject> & { setupCompleted?: string }): Promise<Project | undefined> {
    const result = await this.db.update(projects)
      .set({
        name: updates.name !== undefined ? updates.name || null : undefined,
        logoUrl: updates.logoUrl !== undefined ? updates.logoUrl || null : undefined,
        dappUrl: updates.dappUrl !== undefined ? updates.dappUrl || null : undefined,
        btcAddress: updates.btcAddress !== undefined ? updates.btcAddress || null : undefined,
        thorName: updates.thorName !== undefined ? updates.thorName || null : undefined,
        mayaName: updates.mayaName !== undefined ? updates.mayaName || null : undefined,
        chainflipAddress: updates.chainflipAddress !== undefined ? updates.chainflipAddress || null : undefined,
        setupCompleted: updates.setupCompleted !== undefined ? updates.setupCompleted : undefined,
      })
      .where(eq(projects.id, id))
      .returning();

    return result[0];
  }

  async getMetrics(projectId: string, fromDate?: Date, toDate?: Date): Promise<MetricPoint[]> {
    await this.backfillMetrics(projectId);

    const conditions = [eq(metricPoints.projectId, projectId)];

    if (fromDate) {
      conditions.push(gte(metricPoints.t, fromDate));
    }
    if (toDate) {
      conditions.push(lte(metricPoints.t, toDate));
    }

    const result = await this.db
      .select()
      .from(metricPoints)
      .where(and(...conditions))
      .orderBy(metricPoints.t);

    return result;
  }

  async getTransactions(projectId: string, limit = 25): Promise<Transaction[]> {
    const result = await this.db
      .select()
      .from(transactions)
      .where(eq(transactions.projectId, projectId))
      .orderBy(desc(transactions.ts))
      .limit(limit);

    return result;
  }

  async getApiKeys(projectId: string): Promise<ApiKey[]> {
    const result = await this.db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.projectId, projectId))
      .orderBy(desc(apiKeys.createdAt));

    return result;
  }

  async createApiKey(projectId: string, name: string): Promise<ApiKey> {
    const key = `dk_${randomUUID().replace(/-/g, "")}`;
    const result = await this.db.insert(apiKeys).values({
      projectId,
      name,
      key,
      status: "active",
    }).returning();

    return result[0];
  }

  async deleteApiKey(id: string, projectId: string): Promise<boolean> {
    const result = await this.db
      .delete(apiKeys)
      .where(and(eq(apiKeys.id, id), eq(apiKeys.projectId, projectId)))
      .returning();

    return result.length > 0;
  }

  private async seedProjectMetrics(projectId: string) {
    const now = new Date();
    const daysToGenerate = 30;
    const metricsToInsert: (typeof metricPoints.$inferInsert)[] = [];

    for (let i = daysToGenerate - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      for (let hour = 0; hour < 24; hour++) {
        const pointDate = new Date(date);
        pointDate.setHours(hour, 0, 0, 0);

        const baseVolume = 10000 + Math.random() * 15000;
        const baseFees = baseVolume * (0.003 + Math.random() * 0.002);
        const trades = Math.floor(20 + Math.random() * 40);

        metricsToInsert.push({
          projectId,
          t: pointDate,
          volumeUsd: baseVolume,
          feesUsd: baseFees,
          trades,
        });
      }
    }

    await this.db.insert(metricPoints).values(metricsToInsert);
  }

  private async backfillMetrics(projectId: string) {
    const [latest] = await this.db
      .select({ t: metricPoints.t })
      .from(metricPoints)
      .where(eq(metricPoints.projectId, projectId))
      .orderBy(desc(metricPoints.t))
      .limit(1);

    const now = new Date();
    const targetHour = new Date(now);
    targetHour.setMinutes(0, 0, 0);

    let nextDate = latest?.t ? new Date(latest.t) : new Date(targetHour);
    if (latest?.t) {
      nextDate.setHours(nextDate.getHours() + 1, 0, 0, 0);
    } else {
      nextDate.setDate(nextDate.getDate() - 30);
      nextDate.setHours(0, 0, 0, 0);
    }

    const metricsToInsert: (typeof metricPoints.$inferInsert)[] = [];

    while (nextDate <= targetHour) {
      const baseVolume = 10000 + Math.random() * 15000;
      const baseFees = baseVolume * (0.003 + Math.random() * 0.002);
      const trades = Math.floor(20 + Math.random() * 40);

      metricsToInsert.push({
        projectId,
        t: new Date(nextDate),
        volumeUsd: baseVolume,
        feesUsd: baseFees,
        trades,
      });

      nextDate.setHours(nextDate.getHours() + 1);
    }

    if (metricsToInsert.length > 0) {
      await this.db.insert(metricPoints).values(metricsToInsert);
    }
  }

  private async seedProjectTransactions(projectId: string) {
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
    const transactionsToInsert: (typeof transactions.$inferInsert)[] = [];

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

      transactionsToInsert.push({
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
      });
    }

    await this.db.insert(transactions).values(transactionsToInsert);
  }
}
