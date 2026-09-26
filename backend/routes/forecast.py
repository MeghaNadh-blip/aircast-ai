"""
Time-series multi-hour forecasting endpoint.
"""

import logging
from fastapi import APIRouter, HTTPException, Depends, status
from schemas import ForecastRequest, ForecastResponse
from model_loader import get_artifacts, ModelArtifactRegistry
from services.forecasting_service import ForecastingService
from services.prediction_service import PredictionService
from routes.predict import get_prediction_service

logger = logging.getLogger("AQI-ForecastRoute")
router = APIRouter(prefix="", tags=["Forecasting"])


@router.post(
    "/forecast",
    response_model=ForecastResponse,
    summary="Autoregressive 24h/72h AQI Forecast",
    description="Projects upcoming hourly AQI levels based on diurnal patterns, atmospheric inversion, and lag dynamics."
)
async def generate_forecast(
    payload: ForecastRequest,
    registry: ModelArtifactRegistry = Depends(get_artifacts),
    pred_service: PredictionService = Depends(get_prediction_service)
):
    try:
        forecaster = ForecastingService(registry, pred_service)
        result = forecaster.generate_forecast(
            payload.current_condition,
            horizon_hours=payload.horizon_hours
        )
        return result
    except Exception as e:
        logger.exception(f"Forecasting error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Forecasting pipeline error: {str(e)}"
        )
