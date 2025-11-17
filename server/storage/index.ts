import { DbStorage } from "./db.js";
import { MemStorage } from "./mem.js";
import type { IStorage } from "./types.js";

// Using DbStorage for production with Neon database
// export const storage: IStorage = new MemStorage(); // Use this for local testing without database
export const storage: IStorage = new DbStorage();

export { DbStorage, MemStorage };
export * from "./types.js";
