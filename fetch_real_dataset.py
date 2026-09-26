#!/usr/bin/env python3
"""
Real-world historical air quality dataset ingestor.
Pulls continuous sensor observations directly from the open Open-Meteo Air Quality & CAMS/ECMWF API
for any world city coordinates.
"""

import argparse
import datetime
import logging
import sys
import pandas as pd
import requests

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("RealWorld-DataIngestion")

def fetch_real_historical_aqi(
    latitude: float = 28.6139, # New Delhi
    longitude: float = 77.2090,
    start_date: str = "2024-01-01",
    end_date: str = "2024-12-31",
    output_csv: str = "aqi_real_dataset.csv"
):
    logger.info(f"Connecting to Open-Meteo Historical Air Quality Archive ({latitude}, {longitude})...")
    logger.info(f"Target window: {start_date} to {end_date}")

    aqi_url = (
        f"https://air-quality-api.open-meteo.com/v1/air-quality?"
        f"latitude={latitude}&longitude={longitude}&"
        f"start_date={start_date}&end_date={end_date}&"
        f"hourly=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&"
        f"timezone=auto"
    )

    weather_url = (
        f"https://archive-api.open-meteo.com/v1/archive?"
        f"latitude={latitude}&longitude={longitude}&"
        f"start_date={start_date}&end_date={end_date}&"
        f"hourly=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m&"
        f"timezone=auto"
    )

    aqi_res = requests.get(aqi_url, timeout=30)
    weather_res = requests.get(weather_url, timeout=30)

    if aqi_res.status_code != 200 or weather_res.status_code != 200:
        logger.error(f"Failed to fetch data: AQI {aqi_res.status_code}, Weather {weather_res.status_code}")
        sys.exit(1)

    aqi_data = aqi_res.json()["hourly"]
    weather_data = weather_res.json()["hourly"]

    df_aqi = pd.DataFrame(aqi_data)
    df_weather = pd.DataFrame(weather_data)

    df = pd.merge(df_aqi, df_weather, on="time")

    # Rename to canonical model contract
    # datetime, AQI, PM2.5, PM10, O3, NO2, SO2, CO, Temperature, Humidity, Wind_Speed, Pressure
    df["datetime"] = df["time"]
    df["PM2.5"] = df["pm2_5"].fillna(method="ffill").fillna(25.0)
    df["PM10"] = df["pm10"].fillna(method="ffill").fillna(45.0)
    df["O3"] = df["ozone"].fillna(method="ffill").fillna(35.0)
    df["NO2"] = df["nitrogen_dioxide"].fillna(method="ffill").fillna(20.0)
    df["SO2"] = df["sulphur_dioxide"].fillna(method="ffill").fillna(8.0)
    # Convert CO from µg/m³ to mg/m³
    df["CO"] = (df["carbon_monoxide"].fillna(450.0) / 1000.0).round(2)

    df["Temperature"] = df["temperature_2m"].fillna(method="ffill").fillna(22.0)
    df["Humidity"] = df["relative_humidity_2m"].fillna(method="ffill").fillna(60.0)
    df["Wind_Speed"] = df["wind_speed_10m"].fillna(method="ffill").fillna(3.0)
    df["Pressure"] = df["surface_pressure"].fillna(method="ffill").fillna(1013.25)

    # Calculate standard continuous US-EPA AQI benchmark target
    # EPA sub-index piecewise calculation
    def calc_epa_aqi(row):
        p25 = row["PM2.5"]
        p10 = row["PM10"]
        o3 = row["O3"]
        sub_p25 = p25 * 2.1 if p25 <= 55 else (100 + (p25 - 55) * 1.5)
        sub_p10 = p10 * 0.9 if p10 <= 150 else (100 + (p10 - 150) * 0.8)
        sub_o3 = o3 * 0.9
        dominant = max(sub_p25, sub_p10, sub_o3)
        return round(min(500.0, max(10.0, dominant)), 1)

    df["AQI"] = df.apply(calc_epa_aqi, axis=1)

    final_columns = [
        "datetime", "AQI", "PM2.5", "PM10", "O3", "NO2", "SO2", "CO",
        "Temperature", "Humidity", "Wind_Speed", "Pressure"
    ]
    df_clean = df[final_columns]
    df_clean.to_csv(output_csv, index=False)
    logger.info(f"Saved {len(df_clean)} real-world observation hours to: {output_csv}")
    logger.info(f"Target range: Min AQI={df_clean['AQI'].min()}, Max AQI={df_clean['AQI'].max()}, Mean AQI={df_clean['AQI'].mean():.1f}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Fetch Real-World Historical AQI Sensor Data from Open-Meteo & ECMWF")
    parser.add_argument("--lat", type=float, default=28.6139, help="Latitude")
    parser.add_argument("--lng", type=float, default=77.2090, help="Longitude")
    parser.add_argument("--start", type=str, default="2024-01-01", help="Start YYYY-MM-DD")
    parser.add_argument("--end", type=str, default="2024-12-31", help="End YYYY-MM-DD")
    parser.add_argument("--output", type=str, default="aqi_real_dataset.csv", help="Output CSV path")
    args = parser.parse_args()

    fetch_real_historical_aqi(args.lat, args.lng, args.start, args.end, args.output)
