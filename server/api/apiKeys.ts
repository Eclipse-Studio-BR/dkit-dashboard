import type { Router } from "express";
import { authMiddleware, asyncHandler } from "./middleware.js";
import type { IStorage } from "../storage/index.js";

export function registerApiKeyRoutes(router: Router, deps: { storage: IStorage }) {
  const { storage } = deps;

  router.get(
    "/api/keys",
    authMiddleware,
    asyncHandler(async (req, res) => {
      const user = await storage.getUser(req.session.userId!);
      if (!user || !user.projectId) {
        return res.status(404).json({ message: "Project not found" });
      }

      const keys = await storage.getApiKeys(user.projectId);

      const formatted = keys.map((k) => ({
        ...k,
        createdAt: k.createdAt.toISOString(),
      }));

      res.json(formatted);
    }),
  );

  router.post(
    "/api/keys",
    authMiddleware,
    asyncHandler(async (req, res) => {
      const user = await storage.getUser(req.session.userId!);
      if (!user || !user.projectId) {
        return res.status(404).json({ message: "Project not found" });
      }

      const { name } = req.body;
      if (!name || name.trim() === "") {
        return res.status(400).json({ message: "API key name is required" });
      }

      const apiKey = await storage.createApiKey(user.projectId, name);

      res.status(201).json({
        ...apiKey,
        createdAt: apiKey.createdAt.toISOString(),
      });
    }),
  );

  router.delete(
    "/api/keys/:id",
    authMiddleware,
    asyncHandler(async (req, res) => {
      const user = await storage.getUser(req.session.userId!);
      if (!user || !user.projectId) {
        return res.status(404).json({ message: "Project not found" });
      }

      const { id } = req.params;
      const success = await storage.deleteApiKey(id, user.projectId);

      if (!success) {
        return res.status(404).json({ message: "API key not found" });
      }

      res.json({ message: "API key deleted successfully" });
    }),
  );
}
