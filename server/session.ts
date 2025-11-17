import session from "express-session";
import pgSession from "connect-pg-simple";
import type { Express } from "express";

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

const ONE_WEEK_MS = 1000 * 60 * 60 * 24 * 7;

/**
 * Shared session middleware configuration used by both the server and serverless API.
 * Mirrors the previous cookie and store behavior while centralizing the setup.
 */
export function createSessionMiddleware() {
  const PgStore = pgSession(session);

  const sessionConfig: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "dkit-partners-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: ONE_WEEK_MS,
    },
  };

  // Use a Neon-backed store when a database URL is available (covers serverless/Vercel).
  if (process.env.DATABASE_URL) {
    sessionConfig.store = new PgStore({
      conObject: {
        connectionString: process.env.DATABASE_URL,
      },
      createTableIfMissing: true,
      // @ts-ignore - pgSession expects a pg.Pool, but Neon HTTP is pool-less.
      pool: undefined,
    });
  }

  return session(sessionConfig);
}

export function applySession(app: Express) {
  app.use(createSessionMiddleware());
}
