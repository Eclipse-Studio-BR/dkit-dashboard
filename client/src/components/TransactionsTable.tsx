import { format } from "date-fns";
import { ExternalLink, Loader2 } from "lucide-react";
import type { Transaction } from "@shared/schema";

interface TransactionsTableProps {
  transactions: Transaction[];
}

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  const getExplorerUrl = (txHash: string, chain: string) => {
    // Return appropriate explorer URL based on chain
    const baseUrls: Record<string, string> = {
      "THOR": "https://viewblock.io/thorchain/tx/",
      "MAYA": "https://www.mayascan.org/tx/",
      "CHAINFLIP": "https://scan.chainflip.io/tx/",
    };
    return `${baseUrls[chain] || baseUrls.THOR}${txHash}`;
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "Completed":
        return {
          color: "text-green-500",
          bgColor: "bg-green-500",
          icon: null,
        };
      case "Refunded":
        return {
          color: "text-red-500",
          bgColor: "bg-red-500",
          icon: null,
        };
      case "Running":
        return {
          color: "text-yellow-500",
          bgColor: "bg-yellow-500",
          icon: <Loader2 className="w-3 h-3 animate-spin" />,
        };
      default:
        return {
          color: "text-muted-foreground",
          bgColor: "bg-muted-foreground",
          icon: null,
        };
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-card-border">
            <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Asset</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Time</th>
            <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">Amount In</th>
            <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">Amount Out</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Status</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Hash</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx, idx) => {
            const statusDisplay = getStatusDisplay(tx.status);
            return (
              <tr 
                key={tx.id} 
                className="border-b border-card-border last:border-0 hover-elevate" 
                data-testid={`row-transaction-${idx}`}
              >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
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
                    {tx.amountIn}
                  </div>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="text-sm font-medium font-tabular">
                    {tx.amountOut}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-medium ${statusDisplay.color}`}
                    data-testid={`status-${tx.status.toLowerCase()}-${idx}`}
                  >
                    {statusDisplay.icon || (
                      <span className={`w-1.5 h-1.5 rounded-full ${statusDisplay.bgColor}`} />
                    )}
                    {tx.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <a
                    href={getExplorerUrl(tx.txHash, tx.chain)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-primary hover:text-primary/80 transition-colors"
                    data-testid={`link-hash-${idx}`}
                  >
                    <span className="truncate max-w-[120px]">{tx.txHash.slice(0, 10)}...{tx.txHash.slice(-8)}</span>
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
