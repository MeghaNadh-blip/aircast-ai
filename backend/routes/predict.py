"""
Inference routes for real-time and bulk batch AQI prediction.
"""

import logging
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends, status
from schemas import (
    EnvironmentalFeatures,
    SinglePredictionResponse,
    BatchPredictionRequest,
    BatchPredictionResponse
)
from model_loader import get_artifacts, ModelArtifactRegistry
from services.prediction_service import PredictionService
from database import get_database

logger = logging.getLogger("AQI-PredictRoute")
router = APIRouter(prefix="", tags=["Inference"])


def get_prediction_service(registry: ModelArtifactRegistry = Depends(get_artifacts)) -> PredictionService:
    return PredictionService(registry)


@router.post(
    "/predict",
    response_model=SinglePredictionResponse,
    summary="Predict AQI for single reading",
    description="Accepts multi-pollutant and weather inputs and returns continuous AQI, category, and health advice."
)
async def predict_single(
    payload: EnvironmentalFeatures,
    service: PredictionService = Depends(get_prediction_service),
    db = Depends(get_database)
):
    try:
        result = service.predict_single(payload)

        # Asynchronously persist prediction to MongoDB if database is enabled
        if db is not None:
            record = {
                "timestamp": datetime.utcnow(),
                "input": payload.model_dump(by_alias=True),
                "prediction": result.model_dump()
            }
            await db["prediction_history"].insert_one(record)

        return result
    except Exception as e:
        logger.exception(f"Error executing single prediction: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference failure: {str(e)}"
        )


@router.post(
    "/batch-predict",
    response_model=BatchPredictionResponse,
    summary="Batch AQI prediction",
    description="Processes up to 1,000 environmental sensor records in a single call."
)
async def predict_batch(
    payload: BatchPredictionRequest,
    service: PredictionService = Depends(get_prediction_service)
):
    try:
        results = service.predict_batch(payload.records)
        return BatchPredictionResponse(
            total_records=len(results),
            predictions=results,
            processed_at=datetime.utcnow()
        )
    except Exception as e:
        logger.exception(f"Error executing batch prediction: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Batch inference failure: {str(e)}"
        )
