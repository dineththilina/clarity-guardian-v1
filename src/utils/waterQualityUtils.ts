import { 
  WaterQualityData, 
  WaterQualityThresholds, 
  WaterQualityStatus,
  defaultThresholds
} from "@/types/water-quality";

export const determineStatus = (
  value: number,
  min: number | undefined,
  max: number | undefined,
  warningMin: number | undefined,
  warningMax: number | undefined
): WaterQualityStatus => {
  if (min !== undefined && value < min) return 'danger';
  if (max !== undefined && value > max) return 'danger';
  if (warningMin !== undefined && value < warningMin) return 'warning';
  if (warningMax !== undefined && value > warningMax) return 'warning';
  return 'good';
};

export const getParameterStatus = (
  data: WaterQualityData,
  parameter: keyof Omit<WaterQualityData, 'timestamp'>,
  thresholds: WaterQualityThresholds = defaultThresholds
): WaterQualityStatus => {
  const value = data[parameter];
  
  switch (parameter) {
    case 'ph':
      return determineStatus(
        value,
        thresholds.ph.min,
        thresholds.ph.max,
        thresholds.ph.warningMin,
        thresholds.ph.warningMax
      );
    case 'turbidity':
      return determineStatus(
        value,
        undefined,
        thresholds.turbidity.max,
        undefined,
        thresholds.turbidity.warningMax
      );
    case 'tds':
      return determineStatus(
        value,
        thresholds.tds.min,
        thresholds.tds.max,
        thresholds.tds.warningMin,
        thresholds.tds.warningMax
      );
    case 'temperature':
      return determineStatus(
        value,
        thresholds.temperature.min,
        thresholds.temperature.max,
        thresholds.temperature.warningMin,
        thresholds.temperature.warningMax
      );
    case 'conductivity':
      return determineStatus(
        value,
        thresholds.conductivity.min,
        thresholds.conductivity.max,
        thresholds.conductivity.warningMin,
        thresholds.conductivity.warningMax
      );
    case 'dissolvedOxygen':
      return determineStatus(
        value,
        thresholds.dissolvedOxygen.min,
        undefined,
        thresholds.dissolvedOxygen.warningMin,
        undefined
      );
    default:
      return 'good';
  }
};

export const calculateTrend = (
  currentData: WaterQualityData[],
  parameter: keyof Omit<WaterQualityData, 'timestamp'>,
  dataPoints: number = 2
): number => {
  if (currentData.length < dataPoints) return 0;
  
  const latestValue = currentData[currentData.length - 1][parameter];
  const previousValue = currentData[currentData.length - dataPoints][parameter];
  
  if (previousValue === 0) return 0;
  
  return ((latestValue - previousValue) / previousValue) * 100;
};

export const getParameterInfo = (parameter: keyof Omit<WaterQualityData, 'timestamp'>) => {
  const parameterInfo = {
    ph: {
      title: "pH Level",
      unit: "",
      description: "Acidity/Alkalinity balance",
      color: "#26c6da"
    },
    turbidity: {
      title: "Turbidity",
      unit: "NTU",
      description: "Water cloudiness",
      color: "#ffa726"
    },
    tds: {
      title: "Total Dissolved Solids",
      unit: "mg/L",
      description: "Dissolved matter in water",
      color: "#8d6e63"
    },
    temperature: {
      title: "Temperature",
      unit: "°C",
      description: "Water temperature",
      color: "#ef5350"
    },
    conductivity: {
      title: "Conductivity",
      unit: "μS/cm",
      description: "Electrical conductivity",
      color: "#66bb6a"
    },
    dissolvedOxygen: {
      title: "Dissolved Oxygen",
      unit: "mg/L",
      description: "Oxygen content in water",
      color: "#5c6bc0"
    }
  };
  
  return parameterInfo[parameter];
};

export const fetchDataFromGoogleSheets = async (sheetUrl: string): Promise<WaterQualityData[]> => {
  try {
    const sheetIdMatch = sheetUrl.match(/\/d\/(.*?)\/|\/d\/(.*?)$/);
    if (!sheetIdMatch) {
      throw new Error("Invalid Google Sheets URL format");
    }
    
    const sheetId = sheetIdMatch[1] || sheetIdMatch[2];
    
    const publishedSheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;
    
    const response = await fetch(publishedSheetUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }
    
    const csvText = await response.text();
    
    const rows = parseCSV(csvText);
    
    const waterQualityData: WaterQualityData[] = rows.slice(1).map(row => {
      const getValueByColumnName = (name: string, index: number): string => {
        const headerIndex = rows[0].findIndex(h => 
          h.toLowerCase().includes(name.toLowerCase())
        );
        return headerIndex >= 0 ? row[headerIndex] : row[index];
      };
      
      const timestamp = safelyParseTimestamp(getValueByColumnName('time', 1));
      
      return {
        timestamp,
        ph: parseFloat(getValueByColumnName('ph', 4)) || 7.0,
        turbidity: parseFloat(getValueByColumnName('turbidity', 3)) || 1.0,
        tds: parseFloat(getValueByColumnName('tds', 6)) || 220,
        temperature: parseFloat(getValueByColumnName('temperature', 2)) || 22.0,
        conductivity: parseFloat(getValueByColumnName('conductivity', 7)) || 450,
        dissolvedOxygen: parseFloat(getValueByColumnName('dissolvedOxygen', 8)) || 7.5,
      };
    });
    
    waterQualityData.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    if (waterQualityData.length === 1) {
      const entry = {...waterQualityData[0]};
      entry.timestamp = new Date(new Date(entry.timestamp).getTime() - 60000).toISOString();
      waterQualityData.unshift(entry);
    }
    
    return waterQualityData.slice(-100);
  } catch (error) {
    console.error("Error fetching data from Google Sheets:", error);
    throw error;
  }
};

function parseCSV(csvText: string): string[][] {
  const rows: string[][] = [];
  const lines = csvText.split('\n');
  
  for (const line of lines) {
    if (line.trim() === '') continue;
    
    const row: string[] = [];
    let inQuotes = false;
    let currentValue = '';
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        row.push(currentValue);
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    
    row.push(currentValue);
    rows.push(row);
  }
  
  return rows;
}

function safelyParseTimestamp(timestamp: string): string {
  try {
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(timestamp)) {
      return timestamp;
    }
    
    if (/^\d{4}-\d{2}-\d{2}\s\d{1,2}:\d{2}:\d{2}$/.test(timestamp)) {
      const [datePart, timePart] = timestamp.split(' ');
      
      const date = new Date(`${datePart}T${timePart}`);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
    }
    
    const date = new Date(timestamp);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
    
    console.warn("Could not parse timestamp:", timestamp);
    return new Date().toISOString();
  } catch (e) {
    console.error("Error parsing timestamp:", e);
    return new Date().toISOString();
  }
}
