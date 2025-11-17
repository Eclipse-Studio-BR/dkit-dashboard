import type { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { asyncHandler } from "./middleware.js";
import type { IStorage } from "../storage/index.js";

export function registerAuthRoutes(router: Router, deps: { storage: IStorage }) {
  const { storage } = deps;

  router.post(
    "/api/auth/register",
    asyncHandler(async (req, res) => {
      console.log("[REGISTER] Request body:", JSON.stringify(req.body, null, 2));

      const { name, email, password, confirmPassword } = req.body;

      const registerSchema = z
        .object({
          name: z.string().min(1, "Name is required"),
          email: z.string().email("Invalid email address"),
          password: z.string().min(6, "Password must be at least 6 characters"),
          confirmPassword: z.string(),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: "Passwords don't match",
          path: ["confirmPassword"],
        });

      const userData = registerSchema.parse({ name, email, password, confirmPassword });
      console.log("[REGISTER] User data validated:", { name: userData.name, email: userData.email });

      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Create an empty project
      const newProject = await storage.createProject({});

      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await storage.createUser(
        {
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
        },
        newProject.id,
      );

      req.session.userId = user.id;

      res.status(201).json({
        user: { ...user, password: undefined },
        project: newProject,
      });
    }),
  );

  router.post(
    "/api/auth/login",
    asyncHandler(async (req, res) => {
      const { email, password } = req.body;

      const user = await storage.getUserByEmail(email);
      if (!user || !user.password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      req.session.userId = user.id;

      const project = user.projectId ? await storage.getProject(user.projectId) : null;

      res.json({
        user: { ...user, password: undefined },
        project,
      });
    }),
  );

  router.post(
    "/api/auth/logout",
    asyncHandler(async (req, res) => {
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ message: "Logout failed" });
        }
        res.json({ message: "Logged out successfully" });
      });
    }),
  );
}
