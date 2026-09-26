import { EnvironmentalData } from '../types/aqi';

export interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
}

export interface LiveAirQualityResponse {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  environmentalData: EnvironmentalData;
  source: string;
  fetchedAt: string;
}

/**
 * Searches cities using Open-Meteo Geocoding API (free, no API key required).
 */
export async function searchCities(query: string): Promise<GeocodingResult[]> {
  if (!query || query.trim().length < 2) return [];

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      query.trim()
    )}&count=6&language=en&format=json`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Geocoding HTTP ${res.status}`);
    const data = await res.json();

    return (data.results || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      latitude: item.latitude,
      longitude: item.longitude,
      country: item.country || '',
      admin1: item.admin1 || '',
    }));
  } catch (err) {
    console.error('Error searching cities:', err);
    return [];
  }
}

/**
 * Fetches real-time air quality pollutants and weather data from Open-Meteo Air Quality & Weather APIs.
 * Combines:
 * - Air Quality: PM2.5, PM10, Nitrogen dioxide (NO2), Sulfur dioxide (SO2), Carbon monoxide (CO), Ozone (O3)
 * - Weather: Temperature, Relative Humidity, Wind Speed (10m), Surface Pressure
 */
export async function fetchLiveAirQualityByCoordinates(
  lat: number,
  lng: number,
  cityName: string,
  countryName: string
): Promise<LiveAirQualityResponse> {
  // 1. Fetch Air Quality Pollutants
  const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&hourly=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&timezone=auto`;

  // 2. Fetch Meteorological Conditions
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m&timezone=auto`;

  const [aqiRes, weatherRes] = await Promise.all([
    fetch(aqiUrl),
    fetch(weatherUrl),
  ]);

  if (!aqiRes.ok) throw new Error(`Air Quality API error: HTTP ${aqiRes.status}`);
  if (!weatherRes.ok) throw new Error(`Weather API error: HTTP ${weatherRes.status}`);

  const aqiData = await aqiRes.json();
  const weatherData = await weatherRes.json();

  const currentAqi = aqiData.current || {};
  const currentWeather = weatherData.current || {};

  // Extract raw pollutant readings with safe fallbacks
  // Note: Open-Meteo provides CO in µg/m³; we convert to standard mg/m³ (/ 1000) for our model
  const rawCo = currentAqi.carbon_monoxide ?? 450.0;
  const coMg = Number((rawCo / 1000.0).toFixed(2));

  const pm25 = Number((currentAqi.pm2_5 ?? 25.0).toFixed(1));
  const pm10 = Number((currentAqi.pm10 ?? 45.0).toFixed(1));
  const o3 = Number((currentAqi.ozone ?? 38.0).toFixed(1));
  const no2 = Number((currentAqi.nitrogen_dioxide ?? 22.0).toFixed(1));
  const so2 = Number((currentAqi.sulphur_dioxide ?? 8.0).toFixed(1));

  const temperature = Number((currentWeather.temperature_2m ?? 22.0).toFixed(1));
  const humidity = Math.round(currentWeather.relative_humidity_2m ?? 55.0);
  const windSpeed = Number((currentWeather.wind_speed_10m ?? 3.2).toFixed(1));
  const pressure = Number((currentWeather.surface_pressure ?? 1013.25).toFixed(1));

  // Compute 1h & 24h lags from hourly array if available
  const hourlyPm25 = aqiData.hourly?.pm2_5 || [];
  const pm25Lag1 = hourlyPm25.length >= 2 ? hourlyPm25[hourlyPm25.length - 2] : pm25 * 0.98;
  const pm25Lag24 = hourlyPm25.length >= 25 ? hourlyPm25[hourlyPm25.length - 25] : pm25 * 0.95;

  const environmentalData: EnvironmentalData = {
    datetime: currentAqi.time || new Date().toISOString(),
    pm25,
    pm10,
    o3,
    no2,
    so2,
    co: Math.max(coMg, 0.1),
    temperature,
    humidity,
    windSpeed,
    pressure,
    pm25Lag1,
    pm25Lag24,
    aqiLag1: pm25Lag1 * 2.1,
    aqiLag24: pm25Lag24 * 2.05,
  };

  return {
    city: cityName,
    country: countryName,
    latitude: lat,
    longitude: lng,
    environmentalData,
    source: 'Open-Meteo European Centre for Medium-Range Weather Forecasts (ECMWF)',
    fetchedAt: new Date().toLocaleTimeString(),
  };
}
