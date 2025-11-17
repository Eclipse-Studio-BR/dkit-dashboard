import type { Router } from "express";
import { authMiddleware, asyncHandler } from "./middleware.js";
import type { IStorage } from "../storage/index.js";

export function registerTransactionRoutes(router: Router, deps: { storage: IStorage }) {
  const { storage } = deps;

  router.get(
    "/api/transactions",
    authMiddleware,
    asyncHandler(async (req, res) => {
      const user = await storage.getUser(req.session.userId!);
      if (!user || !user.projectId) {
        return res.status(404).json({ message: "Project not found" });
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string) : 25;
      const transactions = await storage.getTransactions(user.projectId, limit);

      const formatted = transactions.map((t) => ({
        ...t,
        ts: t.ts.toISOString(),
        usdNotional: Math.round(t.usdNotional * 100) / 100,
        feeUsd: Math.round(t.feeUsd * 100) / 100,
      }));

      res.json(formatted);
    }),
  );
}
