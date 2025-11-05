import { format } from "date-fns";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { Transaction } from "@shared/schema";

interface TransactionsTableProps {
  transactions: Transaction[];
}

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  const formatAmount = (route: string, usdNotional: number) => {
    const parts = route.split("→");
    const asset = parts[0] || "BTC";
    const sign = Math.random() > 0.5 ? "+" : "-";
    const amount = (usdNotional / 80000).toFixed(3);
    return `${sign}${amount} ${asset}`;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-card-border">
            <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Asset/Route</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Time</th>
            <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">Amount</th>
            <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">Status</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx, idx) => (
            <tr key={tx.id} className="border-b border-card-border last:border-0 hover-elevate" data-testid={`row-transaction-${idx}`}>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  {tx.chain === "THOR" ? (
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-sm font-medium">{tx.route}</span>
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="text-sm text-foreground">
                  {format(new Date(tx.ts), "hh:mmaaa")}
                </div>
                <div className="text-xs text-muted-foreground">
                  {format(new Date(tx.ts), "d MMM yyyy")}
                </div>
              </td>
              <td className="py-3 px-4 text-right">
                <div className="text-sm font-medium font-tabular">
                  {formatAmount(tx.route, tx.usdNotional)}
                </div>
                <div className="text-xs text-muted-foreground font-tabular">
                  ${tx.usdNotional.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </td>
              <td className="py-3 px-4 text-right">
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                    tx.status === "Completed" ? "text-green-500" : "text-red-500"
                  }`}
                  data-testid={`status-${tx.status.toLowerCase()}-${idx}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    tx.status === "Completed" ? "bg-green-500" : "bg-red-500"
                  }`} />
                  {tx.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
