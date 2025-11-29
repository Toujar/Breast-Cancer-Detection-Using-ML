# project/backend/multimodal_predict.py
"""
Combines image and tabular predictions to produce a final score and returns both probabilities,
Grad-CAM and SHAP visuals (base64 strings).
"""

import sys
import os

# Add project root to PYTHONPATH
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from backend.image_predict import load_image_model, predict_image_bytes
from backend.tabular_predict import load_tabular_model, predict_tabular

def load_models(device=None):
    image_model = load_image_model(device)
    tabular_model, scaler, selected_cols = load_tabular_model()
    return {
        'image_model': image_model,
        'tabular_model': tabular_model,
        'scaler': scaler,
        'selected_cols': selected_cols
    }

def predict_multimodal(models_dict, image_bytes, tabular_input, selected_cols, return_shap=False):
    """
    models_dict: output of load_models
    image_bytes: raw image bytes
    tabular_input: dict or list of 10 values
    selected_cols: list of feature names in EXACT training order (CRITICAL!)
    return_shap: whether to compute SHAP return
    Returns:
        image_prob, tabular_prob, final_score, gradcam_b64, shap_b64
    """
    image_model = models_dict['image_model']
    tabular_model = models_dict['tabular_model']
    scaler = models_dict['scaler']

    img_class, img_prob, gradcam_b64 = predict_image_bytes(image_model, image_bytes)
    tab_class, tab_prob, shap_b64 = predict_tabular(tabular_model, scaler, tabular_input, selected_cols, return_shap=return_shap)

    final_score = float((img_prob + tab_prob) / 2.0)
    return {
        'image_prob': img_prob,
        'tabular_prob': tab_prob,
        'final_score': final_score,
        'image_pred_class': img_class,
        'tabular_pred_class': tab_class,
        'gradcam_b64': gradcam_b64,
        'shap_b64': shap_b64
    }
