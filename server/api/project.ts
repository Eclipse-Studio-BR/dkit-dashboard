import type { Router } from "express";
import { z } from "zod";
import { insertProjectSchema } from "../../shared/schema.js";
import { authMiddleware, asyncHandler } from "./middleware.js";
import type { IStorage } from "../storage/index.js";

export function registerProjectRoutes(router: Router, deps: { storage: IStorage }) {
  const { storage } = deps;

  router.patch(
    "/api/project",
    authMiddleware,
    asyncHandler(async (req, res) => {
      const user = await storage.getUser(req.session.userId!);
      if (!user || !user.projectId) {
        return res.status(404).json({ message: "Project not found" });
      }

      const updateSchema = insertProjectSchema.partial().extend({
        setupCompleted: z.string().optional(),
      });

      const updates = updateSchema.parse(req.body);

      const project = await storage.updateProject(user.projectId, updates);

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      res.json(project);
    }),
  );
}
