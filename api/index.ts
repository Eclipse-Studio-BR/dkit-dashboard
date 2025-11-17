import express from "express";
import { applySession } from "../server/session.js";
import { registerApi } from "../server/api/index.js";
import { storage } from "../server/storage/index.js";
import { errorHandler } from "../server/api/errorHandler.js";

const app = express();

// Trust proxy for Vercel
app.set("trust proxy", 1);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
applySession(app);
registerApi(app, { storage });
app.use(errorHandler);

export default app;
