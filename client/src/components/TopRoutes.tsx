import { Card, CardContent } from "@/components/ui/card";
import { ChevronUp, ChevronDown } from "lucide-react";
import { SiBitcoin, SiEthereum } from "react-icons/si";

interface RouteCardProps {
  asset: string;
  amount: string;
  change: number;
  icon: "BTC" | "UST" | "ETH" | "CAR";
  color: string;
}

function RouteCard({ asset, amount, change, icon, color }: RouteCardProps) {
  const isPositive = change >= 0;

  const Icon = icon === "BTC" ? SiBitcoin : icon === "ETH" ? SiEthereum : SiBitcoin;

  return (
    <Card className="border-card-border">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <span className="text-xs font-medium text-foreground">{asset}</span>
        </div>
        <div className="space-y-1">
          <div className="text-lg font-bold font-tabular">{amount}</div>
          <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? "text-green-500" : "text-red-500"}`}>
            {isPositive ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {Math.abs(change).toFixed(1)}%
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TopRoutes() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <RouteCard asset="BTC" amount="$24,300.40" change={1.2} icon="BTC" color="bg-orange-500" />
      <RouteCard asset="UST" amount="$13,400.20" change={0.4} icon="UST" color="bg-blue-500" />
      <RouteCard asset="ETH" amount="$4,000.80" change={3.4} icon="ETH" color="bg-purple-500" />
      <RouteCard asset="CAR" amount="$1,900.10" change={-0.9} icon="CAR" color="bg-cyan-500" />
    </div>
  );
}
