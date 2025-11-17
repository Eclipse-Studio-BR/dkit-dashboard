import { useQuery } from "@tanstack/react-query";
import type { Transaction } from "@shared/schema";
import { getTransactions } from "@/lib/api";

export function useTransactions(limit?: number, enabled = true) {
  return useQuery<Transaction[]>({
    queryKey: ["/api/transactions", limit ?? "default"],
    queryFn: () => getTransactions(limit),
    enabled,
  });
}
