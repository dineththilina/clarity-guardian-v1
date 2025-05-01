import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DataSourceConfig as DataSourceConfigType } from "@/types/water-quality";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Check, Info } from "lucide-react";

interface DataSourceConfigProps {
  config: DataSourceConfigType;
  onConfigChange: (config: DataSourceConfigType) => void;
  onFetchData: () => void;
  isLoading: boolean;
}

const DataSourceConfig = ({
  config,
  onConfigChange,
  onFetchData,
  isLoading
}: DataSourceConfigProps) => {
  const [tempConfig, setTempConfig] = useState<DataSourceConfigType>(config);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate Google Sheets URL
    if (!tempConfig.sheetUrl.includes("docs.google.com/spreadsheets")) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid Google Sheets URL",
        variant: "destructive",
      });
      return;
    }
    
    // First update the configuration
    onConfigChange(tempConfig);
    
    // Then explicitly trigger data fetch with a small delay to ensure config is updated
    setTimeout(() => {
      onFetchData();
    }, 0);
    
    toast({
      title: "Configuration Updated",
      description: "Data source configuration has been updated.",
    });
  };

  return (
    <Card className="w-full mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertCircle className="mr-2 h-5 w-5 text-water-600" />
          Data Source Configuration
        </CardTitle>
        <CardDescription>
          Connect to your Google Sheets data
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <Alert variant="outline" className="bg-blue-50 border-blue-200 mb-4">
            <Info className="h-4 w-4 text-blue-500" />
            <AlertTitle>Required Google Sheets Setup</AlertTitle>
            <AlertDescription className="text-sm">
              Your Google Sheet must be published to the web (File &gt; Share &gt; Publish to web) 
              and should have these columns: index, time, temperature, turbidity, ph, water_level (for TDS)
            </AlertDescription>
          </Alert>
          
          <div className="space-y-2">
            <Label htmlFor="sheetUrl">Google Sheets URL</Label>
            <Input
              id="sheetUrl"
              placeholder="https://docs.google.com/spreadsheets/d/your-sheet-id/edit"
              value={tempConfig.sheetUrl}
              onChange={(e) => setTempConfig({ ...tempConfig, sheetUrl: e.target.value })}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">
              Paste the full URL of your Google Sheet
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="refreshInterval">Refresh Interval (seconds)</Label>
            <Input
              id="refreshInterval"
              type="number"
              min={5}
              value={tempConfig.refreshInterval}
              onChange={(e) => setTempConfig({ ...tempConfig, refreshInterval: parseInt(e.target.value) || 30 })}
              className="w-full"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading} className="bg-water-600 hover:bg-water-700">
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </span>
            ) : (
              <span className="flex items-center">
                <Check className="mr-2 h-4 w-4" />
                Save & Fetch Data
              </span>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default DataSourceConfig;
