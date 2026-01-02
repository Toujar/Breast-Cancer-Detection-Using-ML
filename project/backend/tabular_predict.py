# project/backend/tabular_predict.py
"""
Tabular prediction helper: loads XGBoost model and scaler, predicts class & probability, optional SHAP values.
"""

import sys
import os

# Add project root to PYTHONPATH
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

import joblib
import numpy as np
import pandas as pd
import io
from utils.preprocessing import select_mean_features, get_tabular_dataset

MODELS_DIR = os.path.join(os.path.dirname(__file__), '..', 'models')

def load_tabular_model():
    model_path = os.path.join(MODELS_DIR, 'xgboost_model.pkl')
    scaler_path = os.path.join(MODELS_DIR, 'scaler.pkl')
    if not os.path.exists(model_path) or not os.path.exists(scaler_path):
        raise FileNotFoundError("Tabular model or scaler not found. Please train tabular model first.")
    model = joblib.load(model_path)
    scaler = joblib.load(scaler_path)
    # also return selected feature names
    X_df, _ = get_tabular_dataset()
    selected_cols = select_mean_features(X_df, n=10)
    return model, scaler, selected_cols

def predict_tabular(model, scaler, feature_dict, selected_cols, return_shap=False):
    """
    feature_dict: mapping from feature name to value OR an ordered list of 10 values
    selected_cols: list of feature names in the EXACT order used during training (CRITICAL!)
    return_shap: if True, compute SHAP values and return base64 visualization (requires shap)
    
    Returns:
        pred_class: int (0 or 1)
        confidence: float (confidence percentage)
        proba: array of probabilities for each class
        shap_b64: base64 encoded SHAP plot (if requested)
    """
    # CRITICAL: Use the provided selected_cols to ensure correct feature ordering
    if isinstance(feature_dict, list) or isinstance(feature_dict, tuple):
        # assume in same order as selected_cols
        if len(feature_dict) != len(selected_cols):
            raise ValueError(f"Expected {len(selected_cols)} features, got {len(feature_dict)}")
        row = pd.DataFrame([feature_dict], columns=selected_cols)
    elif isinstance(feature_dict, dict):
        # ensure ordered columns - MUST match training order
        row = pd.DataFrame([{k: feature_dict.get(k, 0.0) for k in selected_cols}])
    else:
        raise ValueError("feature_dict must be list or dict")

    X_s = scaler.transform(row.values)
    proba = model.predict_proba(X_s)[0]  # Get probabilities for both classes
    pred_class = int(model.predict(X_s)[0])
    
    # Calculate confidence as the probability of the predicted class
    confidence = float(proba[pred_class] * 100)  # Convert to percentage

    shap_b64 = None
    if return_shap:
        try:
            import shap
            explainer = shap.TreeExplainer(model)
            # generate waterfall or summary for this single row
            shap_values = explainer.shap_values(row)
            # generate simple plot
            import matplotlib.pyplot as plt
            plt.figure(figsize=(8, 4))
            shap.plots.waterfall(shap.Explanation(values=shap_values[0], base_values=explainer.expected_value, data=row.iloc[0]), show=False)
            buf = io.BytesIO()
            plt.tight_layout()
            plt.savefig(buf, format='png', bbox_inches='tight', dpi=150)
            plt.close()
            buf.seek(0)
            import base64
            shap_b64 = base64.b64encode(buf.getvalue()).decode('utf-8')
            buf.close()
        except Exception as e:
            print(f"SHAP generation failed: {e}")
            shap_b64 = None

    return pred_class, confidence, proba, shap_b64
