import { Button } from "@/components/ui/button";
import { TrendingUp, DollarSign } from "lucide-react";

interface MetricToggleProps {
  value: "fees" | "volume";
  onChange: (value: "fees" | "volume") => void;
}

export function MetricToggle({ value, onChange }: MetricToggleProps) {
  return (
    <div className="inline-flex items-center gap-1 bg-card border border-card-border rounded-md p-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange("fees")}
        className={`h-7 px-3 text-xs ${value === "fees" ? "bg-[var(--accent-yellow-gradient)] text-[var(--active-toggle-fg)] border border-primary-border shadow-sm" : "bg-transparent"}`}
        data-testid="button-metric-fees"
      >
        <TrendingUp className="w-3 h-3 mr-1.5" />
        Fees
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange("volume")}
        className={`h-7 px-3 text-xs ${value === "volume" ? "bg-[var(--accent-yellow-gradient)] text-[var(--active-toggle-fg)] border border-primary-border shadow-sm" : "bg-transparent"}`}
        data-testid="button-metric-volume"
      >
        <DollarSign className="w-3 h-3 mr-1.5" />
        Volume
      </Button>
    </div>
  );
}
