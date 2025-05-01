import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { WaterQualityData, WaterQualityThresholds, WaterQualityStatus as StatusType } from "@/types/water-quality";
import { AlertTriangle, Check, XCircle } from "lucide-react";

interface WaterQualityStatusProps {
  data: WaterQualityData;
  thresholds: WaterQualityThresholds;
}

const WaterQualityStatus = ({ data, thresholds }: WaterQualityStatusProps) => {
  const determineStatus = (
    value: number,
    min: number | undefined,
    max: number | undefined,
    warningMin: number | undefined,
    warningMax: number | undefined
  ): StatusType => {
    if (min !== undefined && value < min) return 'danger';
    if (max !== undefined && value > max) return 'danger';
    if (warningMin !== undefined && value < warningMin) return 'warning';
    if (warningMax !== undefined && value > warningMax) return 'warning';
    return 'good';
  };

  const phStatus = determineStatus(
    data.ph,
    thresholds.ph.min,
    thresholds.ph.max,
    thresholds.ph.warningMin,
    thresholds.ph.warningMax
  );

  const turbidityStatus = determineStatus(
    data.turbidity,
    undefined,
    thresholds.turbidity.max,
    undefined,
    thresholds.turbidity.warningMax
  );

  const tdsStatus = determineStatus(
    data.tds,
    thresholds.tds.min,
    thresholds.tds.max,
    thresholds.tds.warningMin,
    thresholds.tds.warningMax
  );

  const temperatureStatus = determineStatus(
    data.temperature,
    thresholds.temperature.min,
    thresholds.temperature.max,
    thresholds.temperature.warningMin,
    thresholds.temperature.warningMax
  );

  const conductivityStatus = determineStatus(
    data.conductivity,
    thresholds.conductivity.min,
    thresholds.conductivity.max,
    thresholds.conductivity.warningMin,
    thresholds.conductivity.warningMax
  );

  const dissolvedOxygenStatus = determineStatus(
    data.dissolvedOxygen,
    thresholds.dissolvedOxygen.min,
    undefined,
    thresholds.dissolvedOxygen.warningMin,
    undefined
  );

  const statuses = [
    phStatus,
    turbidityStatus,
    tdsStatus,
    temperatureStatus,
    conductivityStatus,
    dissolvedOxygenStatus
  ];

  const goodCount = statuses.filter(s => s === 'good').length;
  const warningCount = statuses.filter(s => s === 'warning').length;
  const dangerCount = statuses.filter(s => s === 'danger').length;

  const overallStatus: StatusType = dangerCount > 0 
    ? 'danger'
    : warningCount > 0
    ? 'warning'
    : 'good';

  const overallPercentage = (goodCount / statuses.length) * 100;

  const StatusIcon = () => {
    switch (overallStatus) {
      case 'good':
        return <Check className="h-6 w-6 text-alert-good" />;
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-alert-warning" />;
      case 'danger':
        return <XCircle className="h-6 w-6 text-alert-danger" />;
    }
  };

  const statusColors = {
    good: "text-alert-good",
    warning: "text-alert-warning",
    danger: "text-alert-danger"
  };

  const progressColors = {
    good: "bg-alert-good",
    warning: "bg-alert-warning",
    danger: "bg-alert-danger"
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Overall Water Quality</span>
          <StatusIcon />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center">
              <span className={`text-xl font-bold ${statusColors[overallStatus]}`}>
                {overallStatus === 'good' 
                  ? 'Excellent' 
                  : overallStatus === 'warning' 
                  ? 'Needs Attention' 
                  : 'Critical'}
              </span>
            </div>
            <span className="text-sm font-medium">{Math.round(overallPercentage)}% optimal</span>
          </div>
          <Progress 
            value={overallPercentage} 
            className={`h-2 ${progressColors[overallStatus]}`}
          />
          <div className="grid grid-cols-2 gap-2 text-sm mt-4">
            <div className="flex justify-between items-center p-2 rounded-md bg-muted/30">
              <span>pH</span>
              <span className={statusColors[phStatus]}>{phStatus.toUpperCase()}</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-md bg-muted/30">
              <span>Turbidity</span>
              <span className={statusColors[turbidityStatus]}>{turbidityStatus.toUpperCase()}</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-md bg-muted/30">
              <span>TDS</span>
              <span className={statusColors[tdsStatus]}>{tdsStatus.toUpperCase()}</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-md bg-muted/30">
              <span>Temperature</span>
              <span className={statusColors[temperatureStatus]}>{temperatureStatus.toUpperCase()}</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-md bg-muted/30">
              <span>Conductivity</span>
              <span className={statusColors[conductivityStatus]}>{conductivityStatus.toUpperCase()}</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-md bg-muted/30">
              <span>Dissolved O₂</span>
              <span className={statusColors[dissolvedOxygenStatus]}>{dissolvedOxygenStatus.toUpperCase()}</span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Last updated: {new Date(data.timestamp).toLocaleString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WaterQualityStatus;
