# project/utils/shap_utils.py
"""
SHAP utilities for XGBoost model explainability.
Produces SHAP summary plot and feature importance plot and returns them as base64 images (PIL -> base64).
"""

import shap
import matplotlib.pyplot as plt
import io
import base64
from PIL import Image

def shap_summary_plot_to_base64(explainer, X, max_display=10):
    """
    Creates SHAP summary plot and returns base64 PNG.
    """
    plt.figure(figsize=(6,4))
    shap.summary_plot(explainer.shap_values(X), X, show=False, max_display=max_display)
    buf = io.BytesIO()
    plt.tight_layout()
    plt.savefig(buf, format='png', bbox_inches='tight')
    plt.close()
    buf.seek(0)
    img = Image.open(buf).convert('RGB')
    b64 = base64.b64encode(buf.getvalue()).decode('utf-8')
    buf.close()
    return b64

def shap_force_plot_to_base64(explainer, X_row):
    """
    For a single prediction row: returns force plot as base64 PNG.
    """
    shap_values = explainer.shap_values(X_row)
    # force_plot returns an HTML or JS object; easier to use shap.plots.waterfall for a single row
    plt.figure(figsize=(6,3))
    shap.plots.waterfall(shap.Explanation(values=shap_values[0], base_values=explainer.expected_value, data=X_row.iloc[0]), show=False)
    buf = io.BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight')
    plt.close()
    buf.seek(0)
    b64 = base64.b64encode(buf.getvalue()).decode('utf-8')
    buf.close()
    return b64
