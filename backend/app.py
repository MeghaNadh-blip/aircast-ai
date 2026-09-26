"""
FastAPI Application Entry Point with Lifecycle Management and CORS.
"""

import time
import os
import logging
from datetime import datetime
from contextlib import asynccontextmanager
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from schemas import HealthCheckResponse
from database import MongoDBManager
from model_loader import ModelArtifactRegistry
from routes.predict import router as predict_router
from routes.forecast import router as forecast_router
from routes.analytics import router as analytics_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s"
)
logger = logging.getLogger("AQI-Application")

START_TIME = time.time()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown lifecycle."""
    logger.info("Initializing AQI Prediction System...")

    # 1. Connect MongoDB Atlas
    await MongoDBManager.connect()

    # 2. Preload ML Model & Scaler into RAM
    try:
        ModelArtifactRegistry.load_artifacts()
    except Exception as e:
        logger.warning(f"Note: Model artifacts pending training: {e}")

    yield

    # Graceful Shutdown
    logger.info("Shutting down application...")
    await MongoDBManager.disconnect()


app = FastAPI(
    title="Air Quality Index (AQI) Intelligence & Prediction API",
    description="Production-grade FastAPI backend for real-time AQI prediction, 72h multi-horizon forecasting, and feature importance explainability.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://localhost:5173,https://*.vercel.app,https://*.run.app,*"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(predict_router, prefix="/api/v1")
app.include_router(forecast_router, prefix="/api/v1")
app.include_router(analytics_router, prefix="/api/v1")


@app.get(
    "/health",
    response_model=HealthCheckResponse,
    tags=["System"],
    summary="Liveness and readiness probe"
)
async def health_check():
    db = MongoDBManager.db
    is_db_connected = False
    if db is not None:
        try:
            await MongoDBManager.client.admin.command('ping')
            is_db_connected = True
        except Exception:
            is_db_connected = False

    return HealthCheckResponse(
        status="healthy",
        model_loaded=ModelArtifactRegistry.is_loaded,
        database_connected=is_db_connected,
        timestamp=datetime.utcnow(),
        uptime_seconds=round(time.time() - START_TIME, 2)
    )


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Unhandled exception on {request.url.path}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": "InternalServerError",
            "message": "An unexpected error occurred while processing the request."
        }
    )


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=True)
