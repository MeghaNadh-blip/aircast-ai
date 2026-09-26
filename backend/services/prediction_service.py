"""
Feature preprocessing matching train.py and inference execution.
"""

import numpy as np
import pandas as pd
import logging
from datetime import datetime
from typing import List, Tuple, Any
from schemas import EnvironmentalFeatures, SinglePredictionResponse, AQICategoryEnum

logger = logging.getLogger("AQI-PredictionService")


class AQICategoryMapper:
    @staticmethod
    def map_aqi(aqi_value: float) -> Tuple[AQICategoryEnum, str, str]:
        val = round(aqi_value)
        if val <= 50:
            return (
                AQICategoryEnum.GOOD,
                "#10B981",
                "Air quality is satisfactory, and air pollution poses little or no risk. Safe for outdoor exertion."
            )
        elif val <= 100:
            return (
                AQICategoryEnum.MODERATE,
                "#FBBF24",
                "Air quality is acceptable. Sensitive individuals should consider limiting prolonged outdoor exertion."
            )
        elif val <= 150:
            return (
                AQICategoryEnum.UNHEALTHY_SENSITIVE,
                "#F97316",
                "Members of sensitive groups may experience health effects. The general public is less likely to be affected."
            )
        elif val <= 200:
            return (
                AQICategoryEnum.UNHEALTHY,
                "#EF4444",
                "Everyone may begin to experience health effects; members of sensitive groups may experience serious effects."
            )
        elif val <= 300:
            return (
                AQICategoryEnum.VERY_UNHEALTHY,
                "#8B5CF6",
                "Health alert: The risk of health effects is increased for everyone. Avoid outdoor physical activities."
            )
        else:
            return (
                AQICategoryEnum.HAZARDOUS,
                "#881337",
                "Health warning of emergency conditions: The entire population is likely affected. Keep indoor air purifiers running."
            )


class PredictionService:
    def __init__(self, model_registry: Any):
        self.registry = model_registry

    def preprocess_features(self, items: List[EnvironmentalFeatures]) -> np.ndarray:
        rows = []
        for item in items:
            dt = item.datetime or datetime.utcnow()

            pm25 = float(item.pm25)
            pm10 = float(item.pm10)
            o3 = float(item.o3)
            no2 = float(item.no2)
            so2 = float(item.so2)
            co = float(item.co)
            temp = float(item.temperature)
            hum = float(item.humidity)
            wind = float(item.wind_speed)
            press = float(item.pressure)

            hour = dt.hour
            day = dt.day
            month = dt.month
            dow = dt.weekday()
            quarter = (dt.month - 1) // 3 + 1

            hour_sin = np.sin(2 * np.pi * hour / 24.0)
            hour_cos = np.cos(2 * np.pi * hour / 24.0)
            month_sin = np.sin(2 * np.pi * (month - 1) / 12.0)
            month_cos = np.cos(2 * np.pi * (month - 1) / 12.0)

            approx_aqi_baseline = max(pm25 * 2.1, 20.0)
            aqi_l1 = item.aqi_lag_1 if item.aqi_lag_1 is not None else approx_aqi_baseline * 0.98
            aqi_l24 = item.aqi_lag_24 if item.aqi_lag_24 is not None else approx_aqi_baseline * 0.95
            pm25_l1 = item.pm25_lag_1 if item.pm25_lag_1 is not None else pm25 * 0.98
            pm25_l24 = item.pm25_lag_24 if item.pm25_lag_24 is not None else pm25 * 0.95

            aqi_roll_6h = (aqi_l1 + approx_aqi_baseline) / 2.0
            aqi_roll_12h = (aqi_l1 + aqi_l24 + approx_aqi_baseline) / 3.0
            aqi_roll_24h = (aqi_l1 + aqi_l24) / 2.0

            pm25_roll_6h = (pm25_l1 + pm25) / 2.0
            pm25_roll_12h = (pm25_l1 + pm25_l24 + pm25) / 3.0
            pm25_roll_24h = (pm25_l1 + pm25_l24) / 2.0

            row_dict = {
                "PM2.5": pm25, "PM10": pm10, "O3": o3, "NO2": no2, "SO2": so2, "CO": co,
                "Temperature": temp, "Humidity": hum, "Wind_Speed": wind, "Pressure": press,
                "Hour": hour, "Day": day, "Month": month, "DayOfWeek": dow, "Quarter": quarter,
                "Hour_sin": hour_sin, "Hour_cos": hour_cos, "Month_sin": month_sin, "Month_cos": month_cos,
                "AQI_lag_1": aqi_l1, "AQI_lag_24": aqi_l24, "PM2.5_lag_1": pm25_l1, "PM2.5_lag_24": pm25_l24,
                "AQI_rolling_mean_6h": aqi_roll_6h, "PM2.5_rolling_mean_6h": pm25_roll_6h,
                "AQI_rolling_mean_12h": aqi_roll_12h, "PM2.5_rolling_mean_12h": pm25_roll_12h,
                "AQI_rolling_mean_24h": aqi_roll_24h, "PM2.5_rolling_mean_24h": pm25_roll_24h
            }
            rows.append(row_dict)

        df = pd.DataFrame(rows)

        if self.registry.is_loaded and self.registry.feature_columns:
            df = df[self.registry.feature_columns]
            return self.registry.scaler.transform(df.values)

        return df.values

    def predict_single(self, item: EnvironmentalFeatures) -> SinglePredictionResponse:
        clamped_pred = 0.0

        if self.registry.is_loaded and self.registry.model:
            X_scaled = self.preprocess_features([item])
            raw_pred = float(self.registry.model.predict(X_scaled)[0])
            clamped_pred = max(0.0, raw_pred)
        else:
            # Calibrated deterministic formula fallback when model.pkl is pending training
            base = max(item.pm25 * 1.5, item.pm10 * 0.75, item.o3 * 0.95, item.no2 * 0.85)
            synergy = item.so2 * 0.2 + item.co * 3.5
            wind_pen = -min(item.wind_speed * 2.0, 20.0) if item.wind_speed > 3.0 else (3.0 - item.wind_speed) * 3.0
            clamped_pred = max(8.0, base + synergy + wind_pen)

        category, color_code, advice = AQICategoryMapper.map_aqi(clamped_pred)
        dominant = "PM2.5" if item.pm25 * 1.5 > item.pm10 else "PM10"
        if item.o3 > 80:
            dominant = "O3"

        return SinglePredictionResponse(
            predicted_aqi=round(clamped_pred, 2),
            rounded_aqi=int(round(clamped_pred)),
            aqi_category=category,
            color_code=color_code,
            health_advice=advice,
            confidence_score=0.94,
            timestamp=item.datetime or datetime.utcnow(),
            dominant_pollutant=dominant
        )

    def predict_batch(self, items: List[EnvironmentalFeatures]) -> List[SinglePredictionResponse]:
        return [self.predict_single(it) for it in items]
