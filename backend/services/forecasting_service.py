"""
Auto-regressive 24-hour and 72-hour future AQI forecasting service.
"""

import numpy as np
import logging
from datetime import datetime, timedelta
from typing import List, Any
from schemas import EnvironmentalFeatures, ForecastResponse, HourlyForecastPoint
from services.prediction_service import PredictionService

logger = logging.getLogger("AQI-ForecastingService")


class ForecastingService:
    def __init__(self, model_registry: Any, prediction_service: PredictionService):
        self.registry = model_registry
        self.prediction_service = prediction_service

    def generate_forecast(self, seed_condition: EnvironmentalFeatures, horizon_hours: int = 24) -> ForecastResponse:
        forecast_points: List[HourlyForecastPoint] = []
        current_state = seed_condition.model_copy(deep=True)
        base_time = current_state.datetime or datetime.utcnow()

        recent_aqi_history = [current_state.aqi_lag_1 or (current_state.pm25 * 2.1)]
        recent_pm25_history = [current_state.pm25]

        for step in range(1, horizon_hours + 1):
            forecast_dt = base_time + timedelta(hours=step)
            current_state.datetime = forecast_dt

            hour = forecast_dt.hour
            is_day = 8 <= hour <= 18

            diurnal_temp = np.sin((hour - 9) * np.pi / 12.0) * 4.0
            current_state.temperature = round(seed_condition.temperature + diurnal_temp, 1)

            ozone_mod = max(0.0, np.sin((hour - 7) * np.pi / 10.0)) * 25.0
            current_state.o3 = round(seed_condition.o3 + (ozone_mod if is_day else -10.0), 1)

            current_state.wind_speed = max(0.8, round(seed_condition.wind_speed + (1.2 if is_day else -0.8), 1))

            current_state.aqi_lag_1 = recent_aqi_history[-1]
            current_state.pm25_lag_1 = recent_pm25_history[-1]

            pred = self.prediction_service.predict_single(current_state)
            recent_aqi_history.append(pred.predicted_aqi)
            recent_pm25_history.append(current_state.pm25)

            forecast_points.append(
                HourlyForecastPoint(
                    forecast_time=forecast_dt,
                    hour_step=step,
                    predicted_aqi=pred.predicted_aqi,
                    aqi_category=pred.aqi_category,
                    color_code=pred.color_code,
                    health_advice=pred.health_advice
                )
            )

        return ForecastResponse(
            horizon_hours=horizon_hours,
            generated_at=datetime.utcnow(),
            forecast=forecast_points
        )
