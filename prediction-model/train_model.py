"""
train_model.py — Bike Availability ML Model
COMP30830 | Dublin Bikes

Reads:  final_merged_data_csv.gz
Writes: bike_availability_model.pkl
        bike_availability_model.joblib
        model_features.json
"""

import json
import pickle
import warnings
import numpy as np
import pandas as pd
import joblib

from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeRegressor

warnings.filterwarnings("ignore")

# ─────────────────────────────────────────────
# 1. LOAD DATA
# ─────────────────────────────────────────────
DATA_PATH = "final_merged_data.csv"
print(f"[1/5] Loading data from {DATA_PATH} ...")

# Supports both plain .csv and .gz compressed files
if DATA_PATH.endswith(".gz"):
    import gzip
    with gzip.open(DATA_PATH, "rt") as f:
        df = pd.read_csv(f)
else:
    df = pd.read_csv(DATA_PATH)

print(f"      Loaded {len(df):,} rows × {df.shape[1]} columns")

# ─────────────────────────────────────────────
# 2. FEATURE ENGINEERING
# ─────────────────────────────────────────────
print("[2/5] Engineering features ...")

df["last_reported"] = pd.to_datetime(df["last_reported"])

# Time features
df["day_of_week"] = df["last_reported"].dt.dayofweek   # 0=Mon … 6=Sun
df["is_weekend"]  = df["day_of_week"].isin([5, 6]).astype(int)

# Aggregate weather columns (the dataset stores daily min/max per row)
df["temperature"] = (df["max_air_temperature_celsius"] + df["min_air_temperature_celsius"]) / 2
df["humidity"]    = (df["max_relative_humidity_percent"] + df["min_relative_humidity_percent"]) / 2
df["pressure"]    = (df["max_barometric_pressure_hpa"] + df["min_barometric_pressure_hpa"]) / 2

# Features used for training — must match what Flask passes at prediction time
FEATURES = [
    "station_id",   # which station (strong predictor: capacity differs per station)
    "temperature",  # avg air temperature °C
    "humidity",     # avg relative humidity %
    "pressure",     # avg barometric pressure hPa
    "hour",         # hour of day 0–23  (from original data)
    "day_of_week",  # 0=Monday … 6=Sunday
    "is_weekend",   # binary convenience flag
    "month",        # 1–12  (seasonal effect)
]
TARGET = "num_bikes_available"

df.dropna(subset=FEATURES + [TARGET], inplace=True)
print(f"      After dropna: {len(df):,} rows remain")

# ─────────────────────────────────────────────
# 3. TRAIN / TEST SPLIT
# ─────────────────────────────────────────────
X = df[FEATURES]
y = df[TARGET]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)
print(f"[3/5] Split → train {len(X_train):,}  test {len(X_test):,}")

# ─────────────────────────────────────────────
# 4. TRAIN & COMPARE MODELS
# ─────────────────────────────────────────────
print("[4/5] Training and comparing models ...")

candidates = {
    "Linear Regression":  LinearRegression(),
    "Ridge Regression":   Ridge(alpha=1.0),
    "Decision Tree":      DecisionTreeRegressor(max_depth=10, random_state=42),
    "Random Forest":      RandomForestRegressor(n_estimators=100, n_jobs=-1, random_state=42),
    "Gradient Boosting":  GradientBoostingRegressor(n_estimators=100, learning_rate=0.1, random_state=42),
}

results = {}
for name, model in candidates.items():
    print(f"      {name} ...", end="", flush=True)
    model.fit(X_train, y_train)
    preds      = model.predict(X_test)
    mae        = mean_absolute_error(y_test, preds)
    r2         = r2_score(y_test, preds)
    results[name] = {"model": model, "MAE": mae, "R2": r2}
    print(f"  MAE={mae:.3f}  R²={r2:.4f}")

# Select the model with the lowest MAE
best_name = min(results, key=lambda n: results[n]["MAE"])
best      = results[best_name]
print(f"\n      ✓ Best model: '{best_name}'  MAE={best['MAE']:.3f}  R²={best['R2']:.4f}")

# ─────────────────────────────────────────────
# 5. SAVE ARTEFACTS
# ─────────────────────────────────────────────
print("[5/5] Saving model artefacts ...")

# .pkl  — used by Flask at runtime
with open("bike_availability_model.pkl", "wb") as f:
    pickle.dump(best["model"], f)

# .joblib — alternative format (faster for large numpy arrays)
joblib.dump(best["model"], "bike_availability_model.joblib")

# JSON metadata so Flask (or any other consumer) knows which
# features to pass and in what order
meta = {
    "features":   FEATURES,
    "target":     TARGET,
    "best_model": best_name,
    "mae":        round(best["MAE"], 3),
    "r2":         round(best["R2"], 4),
    "all_results": {
        name: {"MAE": round(v["MAE"], 3), "R2": round(v["R2"], 4)}
        for name, v in results.items()
    },
}
with open("model_features.json", "w") as f:
    json.dump(meta, f, indent=2)

print("      Saved: bike_availability_model.pkl")
print("      Saved: bike_availability_model.joblib")
print("      Saved: model_features.json")

# ─────────────────────────────────────────────
# BONUS: Feature importances
# ─────────────────────────────────────────────
m = best["model"]
if hasattr(m, "feature_importances_"):
    imps = sorted(zip(FEATURES, m.feature_importances_), key=lambda x: -x[1])
    print("\n  Feature importances:")
    for feat, imp in imps:
        bar = "█" * int(imp * 40)
        print(f"    {feat:20s} {bar:40s} {imp:.4f}")

print("\nDone.")
