import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/KpiCard";
import { MetricToggle } from "@/components/MetricToggle";
import { TimeRangeTabs } from "@/components/TimeRangeTabs";
import { TimeSeriesChart } from "@/components/TimeSeriesChart";
import { TransactionsTable } from "@/components/TransactionsTable";
import { TopRoutes } from "@/components/TopRoutes";
import type { MetricsResponse, Transaction } from "@shared/schema";

export default function DashboardPage() {
  const [metric, setMetric] = useState<"fees" | "volume">("fees");
  const [timeRange, setTimeRange] = useState<"1D" | "7D" | "1M" | "3M" | "All">("7D");
  
  // Separate timeframes for each KPI
  const [volumeTimeRange, setVolumeTimeRange] = useState<"1D" | "7D" | "1M" | "3M" | "All">("All");
  const [feesTimeRange, setFeesTimeRange] = useState<"1D" | "7D" | "1M" | "3M" | "All">("All");
  const [transactionsTimeRange, setTransactionsTimeRange] = useState<"1D" | "7D" | "1M" | "3M" | "All">("All");

  const getTimeRangeParams = (range: typeof timeRange) => {
    const now = new Date();
    const to = now.toISOString();
    let from: string;
    
    switch (range) {
      case "1D":
        from = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
        break;
      case "7D":
        from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case "1M":
        from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case "3M":
        from = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case "All":
      default:
        from = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();
        break;
    }
    
    return `?from=${from}&to=${to}`;
  };

  // Metrics query for the chart
  const { data: metricsData, isLoading: metricsLoading, isFetching: metricsFetching } = useQuery<MetricsResponse>({
    queryKey: ["/api/metrics", timeRange],
    queryFn: async () => {
      const params = getTimeRangeParams(timeRange);
      const response = await fetch(`/api/metrics${params}`);
      if (!response.ok) throw new Error("Failed to fetch metrics");
      return response.json();
    },
  });

  // Separate queries for each KPI
  const { data: volumeData, isFetching: volumeFetching } = useQuery<MetricsResponse>({
    queryKey: ["/api/metrics", "volume", volumeTimeRange],
    queryFn: async () => {
      const params = getTimeRangeParams(volumeTimeRange);
      const response = await fetch(`/api/metrics${params}`);
      if (!response.ok) throw new Error("Failed to fetch metrics");
      return response.json();
    },
  });

  const { data: feesData, isFetching: feesFetching } = useQuery<MetricsResponse>({
    queryKey: ["/api/metrics", "fees", feesTimeRange],
    queryFn: async () => {
      const params = getTimeRangeParams(feesTimeRange);
      const response = await fetch(`/api/metrics${params}`);
      if (!response.ok) throw new Error("Failed to fetch metrics");
      return response.json();
    },
  });

  const { data: transactionsData, isFetching: transactionsFetching } = useQuery<MetricsResponse>({
    queryKey: ["/api/metrics", "transactions", transactionsTimeRange],
    queryFn: async () => {
      const params = getTimeRangeParams(transactionsTimeRange);
      const response = await fetch(`/api/metrics${params}`);
      if (!response.ok) throw new Error("Failed to fetch metrics");
      return response.json();
    },
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const chartData = metricsData?.series.map((point) => ({
    t: point.t,
    value: metric === "fees" ? point.feesUsd : point.volumeUsd,
  })) || [];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatBtc = (usdValue: number, btcPrice: number = 80000) => {
    const btc = usdValue / btcPrice;
    return `~ ${btc.toFixed(4)} BTC`;
  };

  // Only show full screen loading on initial load (no data yet)
  if ((metricsLoading && !metricsData) || (transactionsLoading && !transactions)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-US").format(value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">dKiT Partners Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard
          title="Total Volume"
          value={formatCurrency(volumeData?.totals.volumeUsd || 0)}
          btcEquivalent={formatBtc(volumeData?.totals.volumeUsd || 0)}
          testId="total-volume"
          timeRange={volumeTimeRange}
          onTimeRangeChange={setVolumeTimeRange}
          isLoading={volumeFetching}
        />
        <KpiCard
          title="Affiliate Fees Earned"
          value={formatCurrency(feesData?.totals.feesUsd || 0)}
          btcEquivalent={formatBtc(feesData?.totals.feesUsd || 0)}
          testId="affiliate-fees"
          timeRange={feesTimeRange}
          onTimeRangeChange={setFeesTimeRange}
          isLoading={feesFetching}
        />
        <KpiCard
          title="Transactions"
          value={formatNumber(transactionsData?.totals.trades || 0)}
          testId="transactions"
          timeRange={transactionsTimeRange}
          onTimeRangeChange={setTransactionsTimeRange}
          isLoading={transactionsFetching}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border-card-border">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-lg font-semibold">
                  {metric === "fees" ? "Earnings Overview" : "Volume Overview"}
                </CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <MetricToggle value={metric} onChange={setMetric} />
                  <TimeRangeTabs value={timeRange} onChange={setTimeRange} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              {metricsFetching && <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10 rounded-lg">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>}
              <TimeSeriesChart data={chartData} metric={metric} />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Top Routes</h2>
          <TopRoutes />
        </div>
      </div>

      <Card className="border-card-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Latest Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {transactions && transactions.length > 0 ? (
            <TransactionsTable transactions={transactions} />
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <p>We're waiting for your first trades.</p>
              <p className="text-sm mt-2">Add your THOR/Maya/Chainflip IDs in Settings to start tracking.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
