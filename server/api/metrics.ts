import type { Router } from "express";
import { authMiddleware, asyncHandler } from "./middleware.js";
import type { IStorage } from "../storage/index.js";

export function registerMetricsRoutes(router: Router, deps: { storage: IStorage }) {
  const { storage } = deps;

  router.get(
    "/api/metrics",
    authMiddleware,
    asyncHandler(async (req, res) => {
      const user = await storage.getUser(req.session.userId!);
      if (!user || !user.projectId) {
        return res.status(404).json({ message: "Project not found" });
      }

      const { from, to } = req.query;
      const fromDate = from ? new Date(from as string) : undefined;
      const toDate = to ? new Date(to as string) : undefined;

      const metrics = await storage.getMetrics(user.projectId, fromDate, toDate);

      const series = metrics.map((m) => ({
        t: m.t.toISOString(),
        volumeUsd: Math.round(m.volumeUsd * 100) / 100,
        feesUsd: Math.round(m.feesUsd * 100) / 100,
        trades: m.trades,
      }));

      const totalVolume = metrics.reduce((sum, m) => sum + m.volumeUsd, 0);
      const totalFees = metrics.reduce((sum, m) => sum + m.feesUsd, 0);
      const totalTrades = metrics.reduce((sum, m) => sum + m.trades, 0);

      const btcPrice = 80000;
      const btcEquivalent = totalFees / btcPrice;

      const last24h = metrics.filter((m) => {
        const time = new Date(m.t).getTime();
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        return time >= oneDayAgo;
      });

      const prev24h = metrics.filter((m) => {
        const time = new Date(m.t).getTime();
        const twoDaysAgo = Date.now() - 48 * 60 * 60 * 1000;
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        return time >= twoDaysAgo && time < oneDayAgo;
      });

      const last24hFees = last24h.reduce((sum, m) => sum + m.feesUsd, 0);
      const prev24hFees = prev24h.reduce((sum, m) => sum + m.feesUsd, 0);
      const change24h = prev24hFees > 0 ? (last24hFees - prev24hFees) / prev24hFees : 0;

      res.json({
        series,
        totals: {
          volumeUsd: Math.round(totalVolume * 100) / 100,
          feesUsd: Math.round(totalFees * 100) / 100,
          trades: totalTrades,
          change24h: Math.round(change24h * 10000) / 10000,
          btcEquivalent: Math.round(btcEquivalent * 10000) / 10000,
        },
      });
    }),
  );
}
