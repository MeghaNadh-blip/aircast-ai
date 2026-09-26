#!/usr/bin/env python3
"""
Generates a realistic synthetic time-series dataset for training and testing
the Air Quality Index (AQI) prediction pipeline.

Schema:
    datetime, AQI, PM2.5, PM10, O3, NO2, SO2, CO, Temperature, Humidity, Wind_Speed, Pressure
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta

def generate_aqi_dataset(n_hours: int = 8760, filename: str = "aqi_dataset.csv"):
    print(f"Generating {n_hours} hourly environmental observations (~1 year)...")
    np.random.seed(42)

    start_date = datetime(2025, 1, 1, 0, 0, 0)
    dates = [start_date + timedelta(hours=i) for i in range(n_hours)]
    
    hours = np.array([d.hour for d in dates])
    months = np.array([d.month for d in dates])
    
    # 1. Meteorology base curves
    # Seasonal temperature: colder in Jan (month 1), warmer in July (month 7)
    seasonal_temp = 20.0 + 12.0 * np.sin((months - 4) * np.pi / 6.0)
    diurnal_temp = 4.0 * np.sin((hours - 9) * np.pi / 12.0)
    temperature = np.clip(seasonal_temp + diurnal_temp + np.random.normal(0, 2.5, n_hours), -5, 45)
    
    # Humidity: inversely related to temperature + rain pulses
    base_humidity = 65.0 - (temperature - 20.0) * 0.8
    humidity = np.clip(base_humidity + np.random.normal(0, 8.0, n_hours), 15, 98)
    
    # Wind speed: higher in afternoons
    wind_speed = np.clip(2.5 + 1.2 * np.sin((hours - 12) * np.pi / 12.0) + np.random.exponential(1.2, n_hours), 0.3, 18.0)
    
    # Pressure: slightly higher in winter
    pressure = np.clip(1013.25 + 4.0 * np.cos((months - 1) * np.pi / 6.0) + np.random.normal(0, 3.0, n_hours), 985, 1032)
    
    # 2. Pollutant simulations
    # Inversion effect: low wind + cold winter nights trap pollutants
    inversion_factor = np.where(wind_speed < 1.8, 1.6, 0.85) * np.where(months.isin([11, 12, 1, 2]), 1.4, 1.0)
    
    # Rush-hour traffic peaks at 8-10 AM and 5-8 PM
    traffic_peak = np.where((hours >= 8) & (hours <= 10) | (hours >= 17) & (hours <= 20), 1.7, 1.0)
    
    # PM2.5 (Combustion / vehicle / industrial)
    base_pm25 = (28.0 + 18.0 * np.random.exponential(0.9, n_hours)) * inversion_factor * traffic_peak
    pm25 = np.clip(base_pm25, 3.0, 380.0)
    
    # PM10 (Coarse + Fine)
    pm10 = np.clip(pm25 * 1.55 + np.random.normal(15.0, 8.0, n_hours) + wind_speed * 1.8, pm25 * 1.05, 550.0)
    
    # NO2 (Vehicular traffic & fossil combustion)
    no2 = np.clip((22.0 + 12.0 * np.random.exponential(0.8, n_hours)) * traffic_peak * inversion_factor, 4.0, 180.0)
    
    # SO2 (Industrial power plants)
    so2 = np.clip((8.0 + 6.0 * np.random.exponential(0.6, n_hours)) * inversion_factor, 1.5, 95.0)
    
    # CO (Incomplete vehicle combustion)
    co = np.clip((0.5 + 0.4 * np.random.exponential(0.7, n_hours)) * traffic_peak, 0.1, 8.5)
    
    # O3 (Ground ozone: photochemical reactions powered by sunlight and high temperatures)
    solar_intensity = np.clip(np.sin((hours - 6) * np.pi / 12.0), 0, 1)
    o3 = np.clip(18.0 + 55.0 * solar_intensity * (temperature / 28.0) + np.random.normal(0, 6.0, n_hours), 5.0, 240.0)
    
    # 3. Ground Truth Continuous AQI Calculation (EPA Sub-index multi-factor synthesis)
    aqi_sub_pm25 = pm25 * 1.45
    aqi_sub_pm10 = pm10 * 0.72
    aqi_sub_o3 = o3 * 0.95
    aqi_sub_no2 = no2 * 0.82
    
    # Dominant max pollutant with interaction penalties
    aqi_dominant = np.maximum.reduce([aqi_sub_pm25, aqi_sub_pm10, aqi_sub_o3, aqi_sub_no2])
    # Add minor synergy from other pollutants & meteorological boundary
    aqi_synergy = (so2 * 0.2 + co * 3.5) + (humidity > 75).astype(int) * 5.0 - (wind_speed > 5.0).astype(int) * 12.0
    
    final_aqi = np.clip(aqi_dominant + aqi_synergy + np.random.normal(0, 3.0, n_hours), 10.0, 480.0)
    
    df = pd.DataFrame({
        "datetime": [d.strftime("%Y-%m-%d %H:%M:%S") for d in dates],
        "AQI": np.round(final_aqi, 1),
        "PM2.5": np.round(pm25, 1),
        "PM10": np.round(pm10, 1),
        "O3": np.round(o3, 1),
        "NO2": np.round(no2, 1),
        "SO2": np.round(so2, 1),
        "CO": np.round(co, 2),
        "Temperature": np.round(temperature, 1),
        "Humidity": np.round(humidity, 1),
        "Wind_Speed": np.round(wind_speed, 1),
        "Pressure": np.round(pressure, 1)
    })
    
    df.to_csv(filename, index=False)
    print(f"Dataset saved to '{filename}' with shape {df.shape}.")
    print("Sample records:")
    print(df.head(3))

if __name__ == "__main__":
    generate_aqi_dataset()
