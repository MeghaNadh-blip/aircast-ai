"""
Artifact loader ensuring model, scaler, and feature definitions load once at startup.
"""

import os
import joblib
import logging
from typing import Any, List, Optional

logger = logging.getLogger("AQI-ModelLoader")

ARTIFACTS_DIR = os.getenv("ARTIFACTS_DIR", os.path.join(os.path.dirname(__file__), "artifacts"))


class ModelArtifactRegistry:
    model: Any = None
    scaler: Any = None
    feature_columns: Optional[List[str]] = None
    is_loaded: bool = False

    @classmethod
    def load_artifacts(cls, artifacts_dir: Optional[str] = None):
        """Loads model.pkl, scaler.pkl, and feature_columns.pkl into global memory."""
        target_dir = artifacts_dir or ARTIFACTS_DIR
        
        model_path = os.path.join(target_dir, "model.pkl")
        scaler_path = os.path.join(target_dir, "scaler.pkl")
        features_path = os.path.join(target_dir, "feature_columns.pkl")

        logger.info(f"Loading ML artifacts from: {target_dir}")

        # Check for artifact presence
        for path, name in [(model_path, "Model"), (scaler_path, "Scaler"), (features_path, "Feature Columns")]:
            if not os.path.exists(path):
                logger.warning(f"Artifact {name} not found at {path}. Model running in heuristic mock fallback until train.py runs.")
                cls.is_loaded = False
                return

        try:
            cls.model = joblib.load(model_path)
            cls.scaler = joblib.load(scaler_path)
            cls.feature_columns = joblib.load(features_path)
            cls.is_loaded = True
            logger.info("Successfully loaded LightGBM Model, Scaler, and Feature Columns.")
        except Exception as e:
            logger.exception(f"Error while deserializing model artifacts: {e}")
            cls.is_loaded = False


def get_artifacts() -> ModelArtifactRegistry:
    return ModelArtifactRegistry
