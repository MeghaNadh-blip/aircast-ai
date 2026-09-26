import { EnvironmentalData } from '../types/aqi';
import { calculateEPAStandardAQI } from '../utils/aqiCalculator';

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
  forecast24h: Array<{
    time: string;
    predictedAQI: number;
    lowerBound: number;
    upperBound: number;
    pm25?: number;
    temperature?: number;
  }>;
  forecast3d: Array<{
    time: string;
    predictedAQI: number;
    lowerBound: number;
    upperBound: number;
    pm25?: number;
    temperature?: number;
  }>;
  forecast7d: Array<{
    time: string;
    predictedAQI: number;
    lowerBound: number;
    upperBound: number;
    pm25?: number;
    temperature?: number;
  }>;
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
 * - Air Quality: US AQI, European AQI, PM2.5, PM10, Nitrogen dioxide (NO2), Sulfur dioxide (SO2), Carbon monoxide (CO), Ozone (O3)
 * - Weather: Temperature, Relative Humidity, Wind Speed (10m), Surface Pressure
 * - Real hourly past 24-hour sensor observations
 * - Real hourly 24h, 3-day (72h), and 7-day (168h) forecasts
 */
export async function fetchLiveAirQualityByCoordinates(
  lat: number,
  lng: number,
  cityName: string,
  countryName: string
): Promise<LiveAirQualityResponse> {
  // 1. Fetch Air Quality Pollutants (past 1 day + 7 forecast days)
  const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&current=us_aqi,european_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&hourly=us_aqi,european_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&past_days=1&forecast_days=7&timezone=auto`;

  // 2. Fetch Meteorological Conditions (past 1 day + 7 forecast days)
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m&past_days=1&forecast_days=7&timezone=auto`;

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

  // Compute exact official EPA standard AQI & dominant pollutant
  const epaCalc = calculateEPAStandardAQI({
    pm25,
    pm10,
    o3,
    no2,
    so2,
    co: coMg,
  });

  // Real ground truth measured US AQI
  const measuredAqi = typeof currentAqi.us_aqi === 'number' && currentAqi.us_aqi > 0
    ? currentAqi.us_aqi
    : epaCalc.aqi;

  const europeanAqi = typeof currentAqi.european_aqi === 'number'
    ? currentAqi.european_aqi
    : undefined;

  // Process hourly arrays from Open-Meteo
  const aqiTimes: string[] = aqiData.hourly?.time || [];
  const aqiUsAqi: (number | null)[] = aqiData.hourly?.us_aqi || [];
  const aqiPm25: (number | null)[] = aqiData.hourly?.pm2_5 || [];
  const aqiPm10: (number | null)[] = aqiData.hourly?.pm10 || [];
  const aqiO3: (number | null)[] = aqiData.hourly?.ozone || [];
  const aqiNo2: (number | null)[] = aqiData.hourly?.nitrogen_dioxide || [];
  const aqiSo2: (number | null)[] = aqiData.hourly?.sulphur_dioxide || [];
  const aqiCo: (number | null)[] = aqiData.hourly?.carbon_monoxide || [];

  const weatherTimes: string[] = weatherData.hourly?.time || [];
  const weatherTemp: (number | null)[] = weatherData.hourly?.temperature_2m || [];
  const weatherHum: (number | null)[] = weatherData.hourly?.relative_humidity_2m || [];
  const weatherWind: (number | null)[] = weatherData.hourly?.wind_speed_10m || [];

  // Align current time with hourly series
  const currentTime = currentAqi.time || '';
  let currentIdx = aqiTimes.indexOf(currentTime);
  if (currentIdx === -1) {
    currentIdx = aqiTimes.findIndex(t => t >= currentTime);
    if (currentIdx === -1) {
      currentIdx = Math.min(24, Math.max(0, aqiTimes.length - 1));
    }
  }

  // 1. Process 24-hour Historical Trend (past 24h of real observations)
  const historyStart = Math.max(0, currentIdx - 23);
  const historyIndices: number[] = [];
  for (let i = historyStart; i <= currentIdx; i++) {
    historyIndices.push(i);
  }

  const history24h = historyIndices.map((i) => {
    const timeIso = aqiTimes[i] || '';
    const date = new Date(timeIso);
    const hourLabel = isNaN(date.getTime())
      ? `${String(i % 24).padStart(2, '0')}:00`
      : `${String(date.getHours()).padStart(2, '0')}:00`;

    const hPm25 = aqiPm25[i] ?? pm25;
    const hPm10 = aqiPm10[i] ?? pm10;
    const hO3 = aqiO3[i] ?? o3;
    const hNo2 = aqiNo2[i] ?? no2;
    const hSo2 = aqiSo2[i] ?? so2;
    const hCo = aqiCo[i] ? Number((aqiCo[i]! / 1000).toFixed(2)) : coMg;

    const calc = calculateEPAStandardAQI({
      pm25: hPm25,
      pm10: hPm10,
      o3: hO3,
      no2: hNo2,
      so2: hSo2,
      co: hCo,
    });

    const hAqi = typeof aqiUsAqi[i] === 'number' && aqiUsAqi[i]! > 0
      ? aqiUsAqi[i]!
      : calc.aqi;

    // Find weather at same index or timestamp
    const wIdx = i < weatherTemp.length ? i : weatherTimes.indexOf(timeIso);
    const hTemp = wIdx >= 0 && typeof weatherTemp[wIdx] === 'number' ? weatherTemp[wIdx]! : temperature;
    const hHum = wIdx >= 0 && typeof weatherHum[wIdx] === 'number' ? Math.round(weatherHum[wIdx]!) : humidity;
    const hWind = wIdx >= 0 && typeof weatherWind[wIdx] === 'number' ? weatherWind[wIdx]! : windSpeed;

    return {
      time: hourLabel,
      aqi: Math.round(hAqi),
      pm25: Math.round(hPm25 * 10) / 10,
      pm10: Math.round(hPm10 * 10) / 10,
      o3: Math.round(hO3 * 10) / 10,
      no2: Math.round(hNo2 * 10) / 10,
      temperature: Number(hTemp.toFixed(1)),
      humidity: hHum,
      windSpeed: Number(hWind.toFixed(1)),
    };
  });

  // Calculate 1h and 24h lags from real historical data
  const pm25Lag1 = history24h.length >= 2 ? history24h[history24h.length - 2].pm25 : pm25;
  const pm25Lag24 = history24h.length >= 24 ? history24h[0].pm25 : pm25;
  const aqiLag1 = history24h.length >= 2 ? history24h[history24h.length - 2].aqi : measuredAqi;
  const aqiLag24 = history24h.length >= 24 ? history24h[0].aqi : measuredAqi;

  // 2. Process Next 24 Hours Forecast (forecast24h)
  const forecast24Indices: number[] = [];
  for (let i = currentIdx + 1; i <= Math.min(currentIdx + 24, aqiTimes.length - 1); i++) {
    forecast24Indices.push(i);
  }

  const forecast24h = forecast24Indices.map((i, step) => {
    const timeIso = aqiTimes[i] || '';
    const date = new Date(timeIso);
    const hourLabel = isNaN(date.getTime())
      ? `${String((currentIdx + step + 1) % 24).padStart(2, '0')}:00`
      : `${String(date.getHours()).padStart(2, '0')}:00`;

    const hPm25 = aqiPm25[i] ?? pm25;
    const hPm10 = aqiPm10[i] ?? pm10;
    const hO3 = aqiO3[i] ?? o3;
    const hNo2 = aqiNo2[i] ?? no2;
    const hSo2 = aqiSo2[i] ?? so2;
    const hCo = aqiCo[i] ? Number((aqiCo[i]! / 1000).toFixed(2)) : coMg;

    const calc = calculateEPAStandardAQI({
      pm25: hPm25,
      pm10: hPm10,
      o3: hO3,
      no2: hNo2,
      so2: hSo2,
      co: hCo,
    });

    const predAqi = typeof aqiUsAqi[i] === 'number' && aqiUsAqi[i]! > 0
      ? aqiUsAqi[i]!
      : calc.aqi;

    const wIdx = i < weatherTemp.length ? i : weatherTimes.indexOf(timeIso);
    const hTemp = wIdx >= 0 && typeof weatherTemp[wIdx] === 'number' ? weatherTemp[wIdx]! : temperature;

    const spread = Math.round(3 + (step + 1) * 0.4);

    return {
      time: hourLabel,
      predictedAQI: Math.round(predAqi),
      lowerBound: Math.max(1, Math.round(predAqi - spread)),
      upperBound: Math.min(500, Math.round(predAqi + spread)),
      pm25: Number(hPm25.toFixed(1)),
      temperature: Number(hTemp.toFixed(1)),
    };
  });

  // 3. Process 3-Day Forecast (72 Hours)
  const forecast3dIndices: number[] = [];
  for (let i = currentIdx + 1; i <= Math.min(currentIdx + 72, aqiTimes.length - 1); i++) {
    forecast3dIndices.push(i);
  }

  const forecast3d = forecast3dIndices.map((i, step) => {
    const timeIso = aqiTimes[i] || '';
    const date = new Date(timeIso);
    const dayLabel = !isNaN(date.getTime())
      ? date.toLocaleDateString('en-US', { weekday: 'short' })
      : `Day ${Math.floor(step / 24) + 1}`;
    const hourLabel = !isNaN(date.getTime())
      ? `${String(date.getHours()).padStart(2, '0')}:00`
      : `${String((step + 1) % 24).padStart(2, '0')}:00`;

    const hPm25 = aqiPm25[i] ?? pm25;
    const calc = calculateEPAStandardAQI({
      pm25: hPm25,
      pm10: aqiPm10[i] ?? pm10,
      o3: aqiO3[i] ?? o3,
      no2: aqiNo2[i] ?? no2,
      so2: aqiSo2[i] ?? so2,
      co: coMg,
    });

    const predAqi = typeof aqiUsAqi[i] === 'number' && aqiUsAqi[i]! > 0
      ? aqiUsAqi[i]!
      : calc.aqi;

    const wIdx = i < weatherTemp.length ? i : weatherTimes.indexOf(timeIso);
    const hTemp = wIdx >= 0 && typeof weatherTemp[wIdx] === 'number' ? weatherTemp[wIdx]! : temperature;

    const spread = Math.round(5 + (step + 1) * 0.25);

    return {
      time: step % 6 === 0 ? `${dayLabel} ${hourLabel}` : '',
      predictedAQI: Math.round(predAqi),
      lowerBound: Math.max(1, Math.round(predAqi - spread)),
      upperBound: Math.min(500, Math.round(predAqi + spread)),
      pm25: Number(hPm25.toFixed(1)),
      temperature: Number(hTemp.toFixed(1)),
    };
  });

  // 4. Process 7-Day Forecast (Daily Aggregate)
  const forecast7d: Array<{
    time: string;
    predictedAQI: number;
    lowerBound: number;
    upperBound: number;
    pm25?: number;
    temperature?: number;
  }> = [];

  for (let day = 0; day < 7; day++) {
    const dayStartIdx = currentIdx + 1 + day * 24;
    const dayEndIdx = Math.min(dayStartIdx + 24, aqiTimes.length);
    if (dayStartIdx >= aqiTimes.length) break;

    const dayValues: number[] = [];
    const dayPm25Values: number[] = [];
    const dayTempValues: number[] = [];

    for (let k = dayStartIdx; k < dayEndIdx; k++) {
      const val = typeof aqiUsAqi[k] === 'number' && aqiUsAqi[k]! > 0 ? aqiUsAqi[k]! : pm25 * 1.5;
      dayValues.push(val);
      if (typeof aqiPm25[k] === 'number') dayPm25Values.push(aqiPm25[k]!);
      if (k < weatherTemp.length && typeof weatherTemp[k] === 'number') dayTempValues.push(weatherTemp[k]!);
    }

    const avgAqi = dayValues.length > 0
      ? dayValues.reduce((a, b) => a + b, 0) / dayValues.length
      : measuredAqi;

    const avgPm25 = dayPm25Values.length > 0
      ? dayPm25Values.reduce((a, b) => a + b, 0) / dayPm25Values.length
      : pm25;

    const avgTemp = dayTempValues.length > 0
      ? dayTempValues.reduce((a, b) => a + b, 0) / dayTempValues.length
      : temperature;

    const dayDate = new Date(Date.now() + (day + 1) * 24 * 3600 * 1000);
    const dayLabel = dayDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const spread = Math.round(8 + (day + 1) * 2);

    forecast7d.push({
      time: dayLabel,
      predictedAQI: Math.round(avgAqi),
      lowerBound: Math.max(1, Math.round(avgAqi - spread)),
      upperBound: Math.min(500, Math.round(avgAqi + spread)),
      pm25: Number(avgPm25.toFixed(1)),
      temperature: Number(avgTemp.toFixed(1)),
    });
  }

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
    aqiLag1,
    aqiLag24,
    measuredAqi,
    europeanAqi,
    dominantPollutant: epaCalc.dominantPollutant,
  };

  return {
    city: cityName,
    country: countryName,
    latitude: lat,
    longitude: lng,
    environmentalData,
    source: 'Open-Meteo European Centre for Medium-Range Weather Forecasts (ECMWF & CAMS)',
    fetchedAt: new Date().toLocaleTimeString(),
    history24h,
    forecast24h,
    forecast3d,
    forecast7d,
  };
}
