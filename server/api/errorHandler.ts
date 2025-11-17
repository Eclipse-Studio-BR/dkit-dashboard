import type { ErrorRequestHandler } from "express";

/**
 * Centralized API error handler that preserves the existing JSON shape.
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({ message });
};
