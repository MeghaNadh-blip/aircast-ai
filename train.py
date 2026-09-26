#!/usr/bin/env python3
"""
Production Training Pipeline: Air Quality Index (AQI) Time-Series Prediction
Model: LightGBM Regressor with TimeSeriesSplit Cross-Validation
Target: AQI
"""

import argparse
import logging
import os
import sys
import warnings
from typing import Dict, List, Tuple

import joblib
import lightgbm as lgb
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import TimeSeriesSplit
from sklearn.preprocessing import RobustScaler

warnings.filterwarnings("ignore")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger("AQI-TimeSeries-Trainer")

DATETIME_COL = "datetime"
TARGET_COL = "AQI"
BASE_NUMERIC_FEATURES = [
    "PM2.5", "PM10", "O3", "NO2", "SO2", "CO",
    "Temperature", "Humidity", "Wind_Speed", "Pressure"
]
EXPECTED_COLUMNS = [DATETIME_COL, TARGET_COL] + BASE_NUMERIC_FEATURES

def load_and_validate_data(file_path: str) -> pd.DataFrame:
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Dataset file not found at: {file_path}")

    logger.info(f"Loading raw dataset from {file_path}...")
    df = pd.read_csv(file_path)

    missing_cols = [c for c in EXPECTED_COLUMNS if c not in df.columns]
    if missing_cols:
        raise ValueError(f"Dataset is missing required columns: {missing_cols}")

    df[DATETIME_COL] = pd.to_datetime(df[DATETIME_COL], errors="coerce")
    null_dates = df[DATETIME_COL].isna().sum()
    if null_dates > 0:
        logger.warning(f"Dropping {null_dates} rows with unparseable datetime.")
        df = df.dropna(subset=[DATETIME_COL])

    df = df.sort_values(by=DATETIME_COL).reset_index(drop=True)
    logger.info(f"Data loaded successfully. Rows: {len(df)}, Date range: {df[DATETIME_COL].min()} to {df[DATETIME_COL].max()}")
    return df

def engineer_temporal_and_cyclical_features(df: pd.DataFrame) -> pd.DataFrame:
    logger.info("Extracting temporal and cyclical features...")
    df = df.copy()
    dt_series = df[DATETIME_COL].dt

    df["Hour"] = dt_series.hour
    df["Day"] = dt_series.day
    df["Month"] = dt_series.month
    df["DayOfWeek"] = dt_series.dayofweek
    df["Quarter"] = dt_series.quarter

    df["Hour_sin"] = np.sin(2 * np.pi * df["Hour"] / 24.0)
    df["Hour_cos"] = np.cos(2 * np.pi * df["Hour"] / 24.0)
    df["Month_sin"] = np.sin(2 * np.pi * (df["Month"] - 1) / 12.0)
    df["Month_cos"] = np.cos(2 * np.pi * (df["Month"] - 1) / 12.0)

    return df

def engineer_timeseries_features(df: pd.DataFrame) -> pd.DataFrame:
    logger.info("Generating time-series lags and rolling window averages...")
    df = df.copy()

    df["AQI_lag_1"] = df["AQI"].shift(1)
    df["AQI_lag_24"] = df["AQI"].shift(24)
    df["PM2.5_lag_1"] = df["PM2.5"].shift(1)
    df["PM2.5_lag_24"] = df["PM2.5"].shift(24)

    windows = [6, 12, 24]
    for w in windows:
        df[f"AQI_rolling_mean_{w}h"] = df["AQI"].shift(1).rolling(window=w, min_periods=1).mean()
        df[f"PM2.5_rolling_mean_{w}h"] = df["PM2.5"].shift(1).rolling(window=w, min_periods=1).mean()

    return df

def handle_missing_values(df: pd.DataFrame) -> pd.DataFrame:
    logger.info("Handling missing values across features and target...")
    df = df.copy()

    for col in BASE_NUMERIC_FEATURES + [TARGET_COL]:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    target_nulls = df[TARGET_COL].isna().sum()
    if target_nulls > 0:
        logger.info(f"Dropping {target_nulls} rows where target AQI is NaN.")
        df = df.dropna(subset=[TARGET_COL])

    feature_impute_cols = [c for c in df.columns if c not in [DATETIME_COL, TARGET_COL]]
    df[feature_impute_cols] = df[feature_impute_cols].ffill().bfill()

    df = df.dropna().reset_index(drop=True)
    logger.info(f"Final dataset shape after lag/imputation processing: {df.shape}")
    return df

def chronological_split(df: pd.DataFrame, test_ratio: float = 0.15) -> Tuple[pd.DataFrame, pd.DataFrame]:
    split_idx = int(len(df) * (1.0 - test_ratio))
    train_df = df.iloc[:split_idx].copy().reset_index(drop=True)
    test_df = df.iloc[split_idx:].copy().reset_index(drop=True)
    logger.info(f"Chronological Split: Train rows = {len(train_df)}, Test rows = {len(test_df)}")
    return train_df, test_df

def cross_validate_and_tune(X_train: np.ndarray, y_train: np.ndarray, n_splits: int = 5) -> Dict[str, float]:
    logger.info(f"Performing TimeSeriesSplit Cross Validation ({n_splits} folds)...")
    tscv = TimeSeriesSplit(n_splits=n_splits)

    fold_maes, fold_rmses, fold_r2s = [], [], []

    base_params = {
        "objective": "regression",
        "metric": "rmse",
        "boosting_type": "gbdt",
        "n_estimators": 500,
        "learning_rate": 0.03,
        "num_leaves": 45,
        "max_depth": 8,
        "subsample": 0.85,
        "colsample_bytree": 0.85,
        "reg_alpha": 0.1,
        "reg_lambda": 1.0,
        "random_state": 42,
        "n_jobs": -1,
        "verbose": -1,
    }

    for fold, (train_idx, val_idx) in enumerate(tscv.split(X_train), 1):
        X_f_train, X_f_val = X_train[train_idx], X_train[val_idx]
        y_f_train, y_f_val = y_train[train_idx], y_train[val_idx]

        model = lgb.LGBMRegressor(**base_params)
        model.fit(
            X_f_train, y_f_train,
            eval_set=[(X_f_val, y_f_val)],
            callbacks=[lgb.early_stopping(stopping_rounds=40, verbose=False)],
        )

        val_preds = model.predict(X_f_val)
        fold_maes.append(mean_absolute_error(y_f_val, val_preds))
        fold_rmses.append(np.sqrt(mean_squared_error(y_f_val, val_preds)))
        fold_r2s.append(r2_score(y_f_val, val_preds))

    cv_results = {
        "CV_Mean_MAE": float(np.mean(fold_maes)),
        "CV_Mean_RMSE": float(np.mean(fold_rmses)),
        "CV_Mean_R2": float(np.mean(fold_r2s)),
    }
    logger.info(f"TimeSeries CV Summary: Mean MAE = {cv_results['CV_Mean_MAE']:.3f}, RMSE = {cv_results['CV_Mean_RMSE']:.3f}, R² = {cv_results['CV_Mean_R2']:.4f}")
    return cv_results

def train_final_model(X_train: np.ndarray, y_train: np.ndarray, X_test: np.ndarray, y_test: np.ndarray) -> lgb.LGBMRegressor:
    logger.info("Training final production LightGBM model...")

    params = {
        "objective": "regression",
        "metric": "rmse",
        "boosting_type": "gbdt",
        "n_estimators": 1500,
        "learning_rate": 0.02,
        "num_leaves": 45,
        "max_depth": 8,
        "min_child_samples": 25,
        "subsample": 0.85,
        "colsample_bytree": 0.85,
        "reg_alpha": 0.2,
        "reg_lambda": 1.2,
        "random_state": 42,
        "n_jobs": -1,
        "verbose": -1,
    }

    model = lgb.LGBMRegressor(**params)
    callbacks = [
        lgb.early_stopping(stopping_rounds=60, verbose=False),
        lgb.log_evaluation(period=200),
    ]

    model.fit(
        X_train, y_train,
        eval_set=[(X_train, y_train), (X_test, y_test)],
        eval_names=["Train", "Test"],
        callbacks=callbacks,
    )

    logger.info(f"Final model training complete. Optimal iteration: {model.best_iteration_}")
    return model

def evaluate_test_predictions(model: lgb.LGBMRegressor, X_test: np.ndarray, y_test: np.ndarray) -> Dict[str, float]:
    preds = model.predict(X_test)
    mae = mean_absolute_error(y_test, preds)
    mse = mean_squared_error(y_test, preds)
    rmse = np.sqrt(mse)
    r2 = r2_score(y_test, preds)

    metrics = {
        "MAE": round(float(mae), 4),
        "RMSE": round(float(rmse), 4),
        "MSE": round(float(mse), 4),
        "R2_Score": round(float(r2), 4),
    }

    logger.info("================ FINAL TEST EVALUATION ================")
    logger.info(f"Mean Absolute Error (MAE):     {metrics['MAE']}")
    logger.info(f"Root Mean Squared Error (RMSE): {metrics['RMSE']}")
    logger.info(f"R-squared Score (R²):          {metrics['R2_Score']}")
    logger.info("=======================================================")
    return metrics

def plot_and_save_feature_importance(model: lgb.LGBMRegressor, feature_names: List[str], save_path: str) -> None:
    logger.info("Generating feature importance visualization...")
    importances = model.feature_importances_
    importance_df = pd.DataFrame({
        "Feature": feature_names,
        "Importance": importances
    }).sort_values(by="Importance", ascending=True)

    plt.figure(figsize=(10, 8))
    plt.barh(importance_df["Feature"], importance_df["Importance"], color="#0891b2", edgecolor="#0e7490")
    plt.title("LightGBM Feature Importance (Split Gain)", fontsize=14, fontweight="bold")
    plt.xlabel("Importance Score", fontsize=12)
    plt.ylabel("Features", fontsize=12)
    plt.grid(axis="x", linestyle="--", alpha=0.5)
    plt.tight_layout()
    plt.savefig(save_path, dpi=300)
    plt.close()
    logger.info(f"Feature importance chart saved -> {save_path}")

def save_pipeline_artifacts(model: lgb.LGBMRegressor, scaler: RobustScaler, feature_columns: List[str], output_dir: str) -> None:
    os.makedirs(output_dir, exist_ok=True)
    logger.info(f"Saving serialized artifacts to directory: {output_dir}")

    joblib.dump(model, os.path.join(output_dir, "model.pkl"))
    joblib.dump(scaler, os.path.join(output_dir, "scaler.pkl"))
    joblib.dump(feature_columns, os.path.join(output_dir, "feature_columns.pkl"))
    logger.info("Exported model.pkl, scaler.pkl, and feature_columns.pkl")

def main():
    parser = argparse.ArgumentParser(description="Air Quality Index (AQI) Time-Series LightGBM Training Pipeline")
    parser.add_argument("--data-path", type=str, default="aqi_dataset.csv", help="Path to the CSV dataset")
    parser.add_argument("--output-dir", type=str, default="backend/artifacts", help="Directory to save artifacts and plots")
    parser.add_argument("--test-ratio", type=float, default=0.15, help="Proportion of latest chronological records reserved for test set")
    parser.add_argument("--cv-splits", type=int, default=5, help="Number of splits for TimeSeriesSplit CV")
    args = parser.parse_args()

    df_raw = load_and_validate_data(args.data_path)
    df_temporal = engineer_temporal_and_cyclical_features(df_raw)
    df_featured = engineer_timeseries_features(df_temporal)
    df_clean = handle_missing_values(df_featured)

    feature_columns = [col for col in df_clean.columns if col not in [DATETIME_COL, TARGET_COL]]
    logger.info(f"Total Engineered Predictors ({len(feature_columns)}): {feature_columns}")

    train_df, test_df = chronological_split(df_clean, test_ratio=args.test_ratio)

    X_train_raw = train_df[feature_columns].values
    y_train = train_df[TARGET_COL].values
    X_test_raw = test_df[feature_columns].values
    y_test = test_df[TARGET_COL].values

    scaler = RobustScaler()
    X_train = scaler.fit_transform(X_train_raw)
    X_test = scaler.transform(X_test_raw)

    cross_validate_and_tune(X_train, y_train, n_splits=args.cv_splits)
    model = train_final_model(X_train, y_train, X_test, y_test)
    evaluate_test_predictions(model, X_test, y_test)

    save_pipeline_artifacts(model, scaler, feature_columns, args.output_dir)
    plot_path = os.path.join(args.output_dir, "feature_importance.png")
    plot_and_save_feature_importance(model, feature_columns, plot_path)
    logger.info("Production training pipeline completed successfully.")

if __name__ == "__main__":
    main()
