"""
Pydantic schemas with strict validation, default ranges, and descriptive examples.
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class AQICategoryEnum(str, Enum):
    GOOD = "Good"
    MODERATE = "Moderate"
    UNHEALTHY_SENSITIVE = "Unhealthy for Sensitive Groups"
    UNHEALTHY = "Unhealthy"
    VERY_UNHEALTHY = "Very Unhealthy"
    HAZARDOUS = "Hazardous"


class EnvironmentalFeatures(BaseModel):
    """Core raw features corresponding to sensor stream."""
    datetime: Optional[datetime] = Field(default_factory=datetime.utcnow, description="ISO 8601 timestamp of measurement")
    pm25: float = Field(..., alias="PM2.5", ge=0.0, le=1000.0, description="Fine particulate matter in µg/m³")
    pm10: float = Field(..., alias="PM10", ge=0.0, le=1500.0, description="Coarse particulate matter in µg/m³")
    o3: float = Field(..., alias="O3", ge=0.0, le=1000.0, description="Ground-level Ozone in µg/m³")
    no2: float = Field(..., alias="NO2", ge=0.0, le=1000.0, description="Nitrogen Dioxide in µg/m³")
    so2: float = Field(..., alias="SO2", ge=0.0, le=1000.0, description="Sulfur Dioxide in µg/m³")
    co: float = Field(..., alias="CO", ge=0.0, le=100.0, description="Carbon Monoxide in mg/m³")
    temperature: float = Field(..., alias="Temperature", ge=-50.0, le=65.0, description="Ambient temperature in °C")
    humidity: float = Field(..., alias="Humidity", ge=0.0, le=100.0, description="Relative Humidity in %")
    wind_speed: float = Field(..., alias="Wind_Speed", ge=0.0, le=150.0, description="Wind speed in m/s")
    pressure: float = Field(..., alias="Pressure", ge=800.0, le=1100.0, description="Atmospheric pressure in hPa")
    
    # Optional historical contexts
    aqi_lag_1: Optional[float] = Field(None, ge=0.0, le=1000.0, description="AQI 1-hour prior")
    aqi_lag_24: Optional[float] = Field(None, ge=0.0, le=1000.0, description="AQI 24-hours prior")
    pm25_lag_1: Optional[float] = Field(None, ge=0.0, le=1000.0, description="PM2.5 1-hour prior")
    pm25_lag_24: Optional[float] = Field(None, ge=0.0, le=1000.0, description="PM2.5 24-hours prior")

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "datetime": "2026-09-25T10:00:00Z",
                "PM2.5": 58.4,
                "PM10": 102.1,
                "O3": 34.5,
                "NO2": 28.2,
                "SO2": 11.4,
                "CO": 0.85,
                "Temperature": 27.5,
                "Humidity": 62.0,
                "Wind_Speed": 3.8,
                "Pressure": 1012.4
            }
        }


class SinglePredictionResponse(BaseModel):
    predicted_aqi: float = Field(..., description="Continuous predicted AQI")
    rounded_aqi: int = Field(..., description="Nearest integer AQI value")
    aqi_category: AQICategoryEnum
    color_code: str = Field(..., description="HEX color representation")
    health_advice: str = Field(..., description="Actionable health precautions")
    confidence_score: float = Field(..., ge=0.0, le=1.0, description="Confidence metric")
    timestamp: datetime
    dominant_pollutant: str


class BatchPredictionRequest(BaseModel):
    records: List[EnvironmentalFeatures] = Field(..., min_length=1, max_length=1000)


class BatchPredictionResponse(BaseModel):
    total_records: int
    predictions: List[SinglePredictionResponse]
    processed_at: datetime


class ForecastRequest(BaseModel):
    current_condition: EnvironmentalFeatures
    horizon_hours: int = Field(default=24, ge=1, le=72, description="Forecast window (24h or 72h)")


class HourlyForecastPoint(BaseModel):
    forecast_time: datetime
    hour_step: int
    predicted_aqi: float
    aqi_category: AQICategoryEnum
    color_code: str
    health_advice: str


class ForecastResponse(BaseModel):
    horizon_hours: int
    generated_at: datetime
    forecast: List[HourlyForecastPoint]


class ModelMetricsResponse(BaseModel):
    model_type: str
    framework: str
    training_metrics: Dict[str, float]
    feature_importance_top10: List[Dict[str, Any]]
    total_features: int
    status: str


class HealthCheckResponse(BaseModel):
    status: str
    model_loaded: bool
    database_connected: bool
    timestamp: datetime
    uptime_seconds: float
