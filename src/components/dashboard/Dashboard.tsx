
import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DataSourceConfig from "./DataSourceConfig";
import MetricCard from "./MetricCard";
import WaterQualityChart from "./WaterQualityChart";
import WaterQualityStatus from "./WaterQualityStatus";
import NotificationBell from "@/components/notifications/NotificationBell";
import { 
  DataSourceConfig as DataSourceConfigType, 
  WaterQualityData, 
  defaultThresholds, 
  mockWaterQualityData 
} from "@/types/water-quality";
import { 
  fetchDataFromGoogleSheets, 
  getParameterStatus, 
  calculateTrend,
  getParameterInfo
} from "@/utils/waterQualityUtils";
import { 
  Droplet, 
  Thermometer, 
  Waves, 
  FlaskConical, 
  Zap, 
  Wind,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNotifications, generateWaterQualityNotification } from "@/context/NotificationContext";

const iconMap = {
  ph: FlaskConical,
  turbidity: Waves,
  tds: Droplet,
  temperature: Thermometer,
  conductivity: Zap,
  dissolvedOxygen: Wind
};

const Dashboard = () => {
  const [config, setConfig] = useState<DataSourceConfigType>({
    sheetUrl: "",
    refreshInterval: 30
  });
  
  const [waterData, setWaterData] = useState<WaterQualityData[]>(mockWaterQualityData);
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const firstLoadRef = useRef<boolean>(true);
  
  const latestData = waterData[waterData.length - 1];

  const fetchData = useCallback(async () => {
    if (!config.sheetUrl) {
      return;
    }
    
    setIsLoading(true);
    console.log("Fetching data from:", config.sheetUrl);
    
    try {
      const data = await fetchDataFromGoogleSheets(config.sheetUrl);
      
      if (data && data.length > 0) {
        setWaterData(data);
        setLastFetched(new Date());
        
        const latestEntry = data[data.length - 1];
        const parameters: (keyof Omit<WaterQualityData, 'timestamp'>)[] = [
          'ph', 'turbidity', 'tds', 'temperature', 'conductivity', 'dissolvedOxygen'
        ];
        
        parameters.forEach(param => {
          const status = getParameterStatus(latestEntry, param);
          if (status === 'danger') {
            addNotification(generateWaterQualityNotification(latestEntry, param, 'danger'));
          } else if (status === 'warning') {
            addNotification(generateWaterQualityNotification(latestEntry, param, 'warning'));
          }
        });
        
        toast({
          title: "Data Updated",
          description: `Successfully fetched ${data.length} rows of water quality data.`,
        });
      } else {
        toast({
          title: "No Data Found",
          description: "No valid data found in the Google Sheet. Check your sheet format.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch data from Google Sheets. Check your URL and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [config.sheetUrl, toast, addNotification]);

  const handleConfigChange = (newConfig: DataSourceConfigType) => {
    // Clear any existing interval when config changes
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setConfig(newConfig);
  };

  // The immediate fetch function triggered by the Save button
  const handleFetchData = useCallback(() => {
    fetchData(); // Fetch data immediately
  }, [fetchData]);

  // Setup the interval for automatic data refresh
  useEffect(() => {
    // Clear previous interval if it exists
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Only set up interval if we have a valid URL and refresh interval
    if (config.sheetUrl && config.refreshInterval > 0) {
      // Fetch data immediately when URL is provided
      if (firstLoadRef.current) {
        console.log("Initial fetch triggered with URL:", config.sheetUrl);
        firstLoadRef.current = false;
        fetchData();
      }
      
      // Then set up the interval
      intervalRef.current = setInterval(fetchData, config.refreshInterval * 1000);
    }
    
    // Cleanup on component unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [config, fetchData]);

  const renderMetricCards = () => {
    const parameters: (keyof Omit<WaterQualityData, 'timestamp'>)[] = [
      'ph', 'turbidity', 'tds', 'temperature', 'conductivity', 'dissolvedOxygen'
    ];
    
    return parameters.map(param => {
      const Icon = iconMap[param];
      const info = getParameterInfo(param);
      const status = getParameterStatus(latestData, param);
      const trend = calculateTrend(waterData, param);
      
      return (
        <MetricCard
          key={param}
          title={info.title}
          value={latestData[param].toFixed(1)}
          unit={info.unit}
          icon={Icon}
          status={status}
          description={info.description}
          trend={trend}
        />
      );
    });
  };

  return (
    <div className="container py-6 relative">
      <div className="absolute top-6 right-6">
        <NotificationBell />
      </div>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-water-900">Water Quality Monitoring</h1>
        <p className="text-muted-foreground">
          Real-time IoT sensor data monitoring for water quality parameters
        </p>
      </div>
      
      <DataSourceConfig
        config={config}
        onConfigChange={handleConfigChange}
        onFetchData={handleFetchData}
        isLoading={isLoading}
      />
      
      {lastFetched && (
        <div className="mb-6 text-sm text-muted-foreground">
          Last data update: {lastFetched.toLocaleString()}
          {config.refreshInterval > 0 && (
            <span> (Refreshing every {config.refreshInterval} seconds)</span>
          )}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <WaterQualityStatus 
          data={latestData}
          thresholds={defaultThresholds}
        />
        <div className="col-span-1 lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {renderMetricCards()}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <WaterQualityChart
          data={waterData}
          parameter="ph"
          title="pH Levels"
          color="#26c6da"
          unit=""
        />
        <WaterQualityChart
          data={waterData}
          parameter="turbidity"
          title="Turbidity"
          color="#ffa726"
          unit="NTU"
        />
        <WaterQualityChart
          data={waterData}
          parameter="tds"
          title="Total Dissolved Solids"
          color="#8d6e63"
          unit="mg/L"
        />
        <WaterQualityChart
          data={waterData}
          parameter="temperature"
          title="Temperature"
          color="#ef5350"
          unit="°C"
        />
        <WaterQualityChart
          data={waterData}
          parameter="conductivity"
          title="Conductivity"
          color="#66bb6a"
          unit="μS/cm"
        />
        <WaterQualityChart
          data={waterData}
          parameter="dissolvedOxygen"
          title="Dissolved Oxygen"
          color="#5c6bc0"
          unit="mg/L"
        />
      </div>
    </div>
  );
};

export default Dashboard;
