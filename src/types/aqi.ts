export type AQICategory = 
  | 'Good'
  | 'Moderate'
  | 'Unhealthy for Sensitive Groups'
  | 'Unhealthy'
  | 'Very Unhealthy'
  | 'Hazardous';

export interface EnvironmentalData {
  datetime: string;
  pm25: number;      // µg/m³
  pm10: number;      // µg/m³
  o3: number;        // µg/m³
  no2: number;       // µg/m³
  so2: number;       // µg/m³
  co: number;        // mg/m³
  temperature: number; // °C
  humidity: number;    // %
  windSpeed: number;   // m/s
  pressure: number;    // hPa
  aqiLag1?: number;
  aqiLag24?: number;
  pm25Lag1?: number;
  pm25Lag24?: number;
}

export interface PredictionResult {
  predictedAQI: number;
  roundedAQI: number;
  category: AQICategory;
  colorCode: string;
  healthAdvice: string;
  vulnerablePopulations: string;
  confidenceScore: number;
  dominantPollutant: 'PM2.5' | 'PM10' | 'O3' | 'NO2' | 'SO2' | 'CO';
  featureContributions: Array<{
    feature: string;
    impact: number;
    direction: 'positive' | 'negative';
  }>;
  calculatedAt: string;
  inferenceTimeMs: number;
}

export interface HourlyForecast {
  hourStep: number;
  forecastTime: string;
  predictedAQI: number;
  lowerBoundAQI: number;
  upperBoundAQI: number;
  confidencePercent: number;
  category: AQICategory;
  colorCode: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  healthRisk: string;
}

export interface CityStation {
  id: string;
  city: string;
  country: string;
  stationName: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  current: EnvironmentalData;
  history24h: Array<{
    time: string;
    aqi: number;
    pm25: number;
    pm10: number;
    o3: number;
    no2: number;
    temperature: number;
    humidity: number;
    windSpeed: number;
  }>;
}

export interface ModelMetricData {
  mae: number;
  rmse: number;
  r2: number;
  mape: number;
  crossValFolds: number;
  trainSamples: number;
  testSamples: number;
  bestIteration: number;
  algorithm: string;
  hyperparameters: Record<string, string | number>;
  featureImportances: Array<{
    feature: string;
    importance: number;
    category: 'Pollutant' | 'Temporal' | 'Lag' | 'Meteorological' | 'Cyclical';
  }>;
}
