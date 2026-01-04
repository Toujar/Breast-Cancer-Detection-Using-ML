# project/backend/tabular_predict.py
"""
MEMORY-OPTIMIZED tabular prediction:
- Load models on-demand only
- No scikit-learn dependency (removed for Python 3.13 compatibility)
- Explicit cleanup
"""

import sys
import os
import gc

# Add project root to PYTHONPATH
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

import joblib
import numpy as np
import pandas as pd

MODELS_DIR = os.path.join(os.path.dirname(__file__), '..', 'models')

def load_tabular_model():
    """Load tabular model with memory optimization"""
    model_path = os.path.join(MODELS_DIR, 'xgboost_model.pkl')
    scaler_path = os.path.join(MODELS_DIR, 'scaler.pkl')
    
    if not os.path.exists(model_path) or not os.path.exists(scaler_path):
        raise FileNotFoundError("Tabular model or scaler not found. Please train tabular model first.")
    
    # Load with minimal memory footprint
    model = joblib.load(model_path)
    scaler = joblib.load(scaler_path)
    
    # Hardcoded selected feature names (from Wisconsin breast cancer dataset)
    selected_cols = [
        'mean radius', 'mean texture', 'mean perimeter', 'mean area', 'mean smoothness',
        'mean compactness', 'mean concavity', 'mean concave points', 'mean symmetry', 'mean fractal dimension'
    ]
    
    print("✅ Tabular model loaded (memory-optimized, no scikit-learn)")
    return model, scaler, selected_cols

def predict_tabular_memory_safe(model, scaler, feature_dict, selected_cols):
    """
    Memory-safe tabular prediction without scikit-learn dependency
    
    Args:
        model: XGBoost model
        scaler: StandardScaler (from joblib)
        feature_dict: Input features as dict
        selected_cols: Feature column names
    
    Returns:
        pred_class: int (0 or 1)
        confidence: float (confidence percentage)
        proba: array of probabilities for each class
    """
    # Prepare input data with memory optimization
    if isinstance(feature_dict, (list, tuple)):
        if len(feature_dict) != len(selected_cols):
            raise ValueError(f"Expected {len(selected_cols)} features, got {len(feature_dict)}")
        row = pd.DataFrame([feature_dict], columns=selected_cols)
    elif isinstance(feature_dict, dict):
        # Ensure ordered columns - MUST match training order
        row = pd.DataFrame([{k: feature_dict.get(k, 0.0) for k in selected_cols}])
    else:
        raise ValueError("feature_dict must be list or dict")
    
    # Scale and predict with memory management
    X_scaled = scaler.transform(row.values)
    
    # Get predictions
    proba = model.predict_proba(X_scaled)[0]  # Probabilities for both classes
    pred_class = int(model.predict(X_scaled)[0])
    
    # Calculate confidence as the probability of the predicted class
    confidence = float(proba[pred_class] * 100)  # Convert to percentage
    
    # Cleanup intermediate variables
    del X_scaled, row
    gc.collect()
    
    return pred_class, confidence, proba
