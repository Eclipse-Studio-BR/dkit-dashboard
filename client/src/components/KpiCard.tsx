import { Card, CardContent } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface KpiCardProps {
  title: string;
  value: string;
  btcEquivalent: string;
  testId?: string;
}

export function KpiCard({ title, value, btcEquivalent, testId }: KpiCardProps) {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <Card className="border-card-border">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <button
            onClick={() => setIsVisible(!isVisible)}
            className="text-muted-foreground hover-elevate p-1 rounded"
            data-testid={`button-toggle-${testId}`}
          >
            {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>
        <div className="space-y-1">
          <div className="text-3xl font-bold font-tabular tracking-tight" data-testid={`text-${testId}`}>
            {isVisible ? value : "••••••••"}
          </div>
          <div className="text-xs text-muted-foreground font-tabular">
            {isVisible ? btcEquivalent : "~•••• BTC"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
