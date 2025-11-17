import type { Express } from "express";
import { registerApi } from "./api/index.js";
import { storage } from "./storage/index.js";
import { applySession } from "./session.js";

export async function registerRoutes(app: Express): Promise<Express> {
  applySession(app);
  registerApi(app, { storage });
  return app;
}
