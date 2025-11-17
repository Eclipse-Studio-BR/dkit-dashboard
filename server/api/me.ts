import type { Router } from "express";
import { authMiddleware, asyncHandler } from "./middleware.js";
import type { IStorage } from "../storage/index.js";

export function registerMeRoutes(router: Router, deps: { storage: IStorage }) {
  const { storage } = deps;

  router.get(
    "/api/me",
    authMiddleware,
    asyncHandler(async (req, res) => {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const project = user.projectId ? await storage.getProject(user.projectId) : null;

      res.json({
        user: { ...user, password: undefined },
        project: project || {
          id: "",
          name: null,
          logoUrl: null,
          dappUrl: null,
          btcAddress: null,
          thorName: null,
          mayaName: null,
          chainflipAddress: null,
          setupCompleted: "false",
        },
      });
    }),
  );
}
