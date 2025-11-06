import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "../server/routes.js";
import path from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let appInstance: express.Express | null = null;

async function getApp() {
  if (appInstance) {
    return appInstance;
  }

  const app = express();

  // Trust proxy for Vercel
  app.set('trust proxy', 1);

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // Serve static files
  const publicPath = path.join(__dirname, '..', 'dist', 'public');
  app.use(express.static(publicPath));

  // Initialize routes
  await registerRoutes(app);

  // Error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Error:", err);
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });

  // Catch-all route for SPA
  app.get('*', (_req: Request, res: Response) => {
    try {
      const indexPath = path.join(publicPath, 'index.html');
      const html = readFileSync(indexPath, 'utf-8');
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (error) {
      res.status(404).send('Not Found');
    }
  });

  appInstance = app;
  return app;
}

export default async function handler(req: Request, res: Response) {
  const app = await getApp();
  return app(req, res);
}
