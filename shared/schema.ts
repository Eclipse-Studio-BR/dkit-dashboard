import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, real, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("PARTNER"),
  projectId: varchar("project_id"),
});

// Projects table
export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  logoUrl: text("logo_url"),
  dappUrl: text("dapp_url"),
  btcAddress: text("btc_address"),
  thorName: text("thor_name"),
  mayaName: text("maya_name"),
  chainflipAddress: text("chainflip_address"),
});

// Metric points (time-series data)
export const metricPoints = pgTable("metric_points", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  t: timestamp("t").notNull(),
  volumeUsd: real("volume_usd").notNull(),
  feesUsd: real("fees_usd").notNull(),
  trades: integer("trades").notNull(),
});

// Transactions
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  ts: timestamp("ts").notNull(),
  route: text("route").notNull(),
  usdNotional: real("usd_notional").notNull(),
  feeUsd: real("fee_usd").notNull(),
  status: text("status").notNull(),
  txHash: text("tx_hash").notNull(),
  chain: text("chain").notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
}).extend({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
}).extend({
  name: z.string().min(1, "Project name is required"),
  logoUrl: z.string().optional(),
  dappUrl: z.string().optional().refine((val) => !val || (val.startsWith("https://") && z.string().url().safeParse(val).success), {
    message: "Must be a valid HTTPS URL or empty"
  }),
  btcAddress: z.string().optional().refine((val) => !val || /^(1|3|bc1)[a-zA-Z0-9]{25,62}$/.test(val), {
    message: "Invalid Bitcoin address"
  }),
  thorName: z.string().optional().refine((val) => !val || /^[a-z0-9-]{1,32}$/.test(val), {
    message: "THORName must be lowercase letters, digits, and dashes only (1-32 chars)"
  }),
  mayaName: z.string().optional().refine((val) => !val || /^[a-z0-9-]{1,32}$/.test(val), {
    message: "MayaName must be lowercase letters, digits, and dashes only (1-32 chars)"
  }),
  chainflipAddress: z.string().optional(),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

export type MetricPoint = typeof metricPoints.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;

// API response types
export interface MeResponse {
  user: User;
  project: Project;
}

export interface MetricsResponse {
  series: Array<{
    t: string;
    volumeUsd: number;
    feesUsd: number;
    trades: number;
  }>;
  totals: {
    volumeUsd: number;
    feesUsd: number;
    trades: number;
    change24h: number;
    btcEquivalent: number;
  };
}

export interface TopRoute {
  asset: string;
  icon: string;
  amount: number;
  change: number;
}
