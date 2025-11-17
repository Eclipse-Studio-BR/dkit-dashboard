import type { Express } from "express";
import { registerAuthRoutes } from "./auth.js";
import { registerMeRoutes } from "./me.js";
import { registerProjectRoutes } from "./project.js";
import { registerMetricsRoutes } from "./metrics.js";
import { registerTransactionRoutes } from "./transactions.js";
import { registerApiKeyRoutes } from "./apiKeys.js";
import type { IStorage } from "../storage/index.js";

/**
 * Attach all API routes to the provided Express app or router.
 */
export function registerApi(app: Express, deps: { storage: IStorage }) {
  registerAuthRoutes(app, deps);
  registerMeRoutes(app, deps);
  registerProjectRoutes(app, deps);
  registerMetricsRoutes(app, deps);
  registerTransactionRoutes(app, deps);
  registerApiKeyRoutes(app, deps);

  return app;
}
