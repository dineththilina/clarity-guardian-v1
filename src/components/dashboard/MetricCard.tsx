
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WaterQualityStatus } from "@/types/water-quality";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: number | string;
  unit: string;
  status: WaterQualityStatus;
  icon: LucideIcon;
  description?: string;
  trend?: number;
}

const MetricCard = ({
  title,
  value,
  unit,
  status,
  icon: Icon,
  description,
  trend
}: MetricCardProps) => {
  const statusColors = {
    good: "bg-alert-good/10 text-alert-good border-alert-good/20",
    warning: "bg-alert-warning/10 text-alert-warning border-alert-warning/20",
    danger: "bg-alert-danger/10 text-alert-danger border-alert-danger/20"
  };

  const statusIconColors = {
    good: "text-alert-good",
    warning: "text-alert-warning",
    danger: "text-alert-danger"
  };

  return (
    <Card className={cn("wave-animation border-2", statusColors[status])}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={cn("h-4 w-4", statusIconColors[status])} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold flex items-end">
          {value}
          <span className="text-sm ml-1 mb-0.5 text-muted-foreground">{unit}</span>
          
          {trend !== undefined && (
            <span className={cn(
              "ml-2 text-xs flex items-center",
              trend > 0 ? "text-alert-good" : trend < 0 ? "text-alert-danger" : "text-muted-foreground"
            )}>
              {trend > 0 ? "↑" : trend < 0 ? "↓" : "→"}
              {Math.abs(trend).toFixed(1)}%
            </span>
          )}
        </div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </CardContent>
    </Card>
  );
};

export default MetricCard;
