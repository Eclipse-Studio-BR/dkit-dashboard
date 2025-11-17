import { useQuery } from "@tanstack/react-query";
import type { MetricsResponse } from "@shared/schema";
import { getMetrics, type TimeRange } from "@/lib/api";

interface UseMetricsOptions {
  enabled?: boolean;
  queryKeyPrefix?: string;
}

export function useMetrics(timeRange: TimeRange, options?: UseMetricsOptions) {
  const { enabled = true, queryKeyPrefix = "default" } = options || {};

  return useQuery<MetricsResponse>({
    queryKey: ["/api/metrics", queryKeyPrefix, timeRange],
    queryFn: () => getMetrics(timeRange),
    enabled,
  });
}
