
export interface WaterQualityData {
  timestamp: string;
  ph: number;
  turbidity: number; // NTU (Nephelometric Turbidity Units)
  tds: number; // Total Dissolved Solids (mg/L or ppm)
  temperature: number; // in Celsius
  conductivity: number; // in μS/cm (microSiemens per centimeter)
  dissolvedOxygen: number; // in mg/L
}

export interface DataSourceConfig {
  sheetUrl: string;
  refreshInterval: number; // in seconds
}

export type WaterQualityStatus = 'good' | 'warning' | 'danger';

export interface WaterQualityThresholds {
  ph: {
    min: number;
    max: number;
    warningMin: number;
    warningMax: number;
  };
  turbidity: {
    max: number;
    warningMax: number;
  };
  tds: {
    min: number;
    max: number;
    warningMin: number;
    warningMax: number;
  };
  temperature: {
    min: number;
    max: number;
    warningMin: number;
    warningMax: number;
  };
  conductivity: {
    min: number;
    max: number;
    warningMin: number;
    warningMax: number;
  };
  dissolvedOxygen: {
    min: number;
    warningMin: number;
  };
}

export const defaultThresholds: WaterQualityThresholds = {
  ph: {
    min: 6.5,
    max: 8.5,
    warningMin: 6.8,
    warningMax: 8.2
  },
  turbidity: {
    max: 5,
    warningMax: 3
  },
  tds: {
    min: 100,
    max: 500,
    warningMin: 150,
    warningMax: 400
  },
  temperature: {
    min: 10,
    max: 30,
    warningMin: 15,
    warningMax: 25
  },
  conductivity: {
    min: 200,
    max: 800,
    warningMin: 300,
    warningMax: 700
  },
  dissolvedOxygen: {
    min: 5,
    warningMin: 6
  }
};

export const mockWaterQualityData: WaterQualityData[] = [
  {
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    ph: 7.2,
    turbidity: 1.2,
    tds: 220,
    temperature: 22.5,
    conductivity: 450,
    dissolvedOxygen: 7.8
  },
  {
    timestamp: new Date(Date.now() - 4 * 60000).toISOString(),
    ph: 7.3,
    turbidity: 1.1,
    tds: 225,
    temperature: 22.6,
    conductivity: 455,
    dissolvedOxygen: 7.7
  },
  {
    timestamp: new Date(Date.now() - 3 * 60000).toISOString(),
    ph: 7.1,
    turbidity: 1.3,
    tds: 215,
    temperature: 22.7,
    conductivity: 445,
    dissolvedOxygen: 7.9
  },
  {
    timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
    ph: 7.0,
    turbidity: 1.4,
    tds: 210,
    temperature: 22.8,
    conductivity: 440,
    dissolvedOxygen: 8.0
  },
  {
    timestamp: new Date(Date.now() - 1 * 60000).toISOString(),
    ph: 7.2,
    turbidity: 1.2,
    tds: 220,
    temperature: 22.9,
    conductivity: 450,
    dissolvedOxygen: 7.8
  },
  {
    timestamp: new Date().toISOString(),
    ph: 7.4,
    turbidity: 1.0,
    tds: 230,
    temperature: 23.0,
    conductivity: 460,
    dissolvedOxygen: 7.6
  }
];
