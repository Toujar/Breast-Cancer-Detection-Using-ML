# project/backend/server.py
"""
FastAPI server exposing endpoints:
- /predict/image
- /predict/tabular
- /predict/multimodal
"""
import sys
import os

# Add project root to PYTHONPATH
ROOT_DIR = os.path.dirname(os.path.dirname(__file__))
sys.path.append(ROOT_DIR)

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
import uvicorn
import traceback
import base64

from .image_predict import load_image_model, predict_image_bytes
from .tabular_predict import load_tabular_model, predict_tabular
from .multimodal_predict import load_models, predict_multimodal

app = FastAPI(title="Breast Cancer Multi-Modal API")

# load models once at startup
@app.on_event("startup")
def load_all_models():
    global IMAGE_MODEL, TAB_MODEL, SCALER, SELECTED_COLS, MODELS_DICT
    try:
        IMAGE_MODEL = load_image_model()
    except Exception as e:
        print("Warning: image model not loaded:", e)
        IMAGE_MODEL = None
    try:
        TAB_MODEL, SCALER, SELECTED_COLS = load_tabular_model()
    except Exception as e:
        print("Warning: tabular model not loaded:", e)
        TAB_MODEL = None
        SCALER = None
        SELECTED_COLS = None
    try:
        MODELS_DICT = load_models()
    except Exception as e:
        MODELS_DICT = None

@app.post("/predict/image")
async def predict_image(file: UploadFile = File(...)):
    try:
        content = await file.read()
        if IMAGE_MODEL is None:
            raise HTTPException(status_code=500, detail="Image model is not loaded on server.")
        pred_class, prob, gradcam_b64 = predict_image_bytes(IMAGE_MODEL, content)
        return JSONResponse({
            "predicted_class": int(pred_class),
            "probability": float(prob),
            "gradcam_base64": gradcam_b64
        })
    except Exception as exc:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(exc))

from pydantic import BaseModel
class TabularIn(BaseModel):
    # Accept arbitrary keys; user must send the 10 selected features by name or list
    features: dict = None
    values: list = None
    return_shap: bool = False

@app.post("/predict/tabular")
def predict_tabular_endpoint(payload: TabularIn):
    try:
        if TAB_MODEL is None or SCALER is None:
            raise HTTPException(status_code=500, detail="Tabular model not loaded.")
        if payload.features is None and payload.values is None:
            raise HTTPException(status_code=400, detail="Provide 'features' dict or 'values' list (10 items).")
        input_data = payload.features if payload.features is not None else payload.values
        pred_class, prob, shap_b64 = predict_tabular(TAB_MODEL, SCALER, input_data, return_shap=payload.return_shap)
        return {
            "predicted_class": int(pred_class),
            "probability": float(prob),
            "shap_base64": shap_b64
        }
    except Exception as exc:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(exc))

from fastapi import Form

@app.post("/predict/multimodal")
async def predict_multimodal_endpoint(file: UploadFile = File(...), features: str = Form(...), return_shap: bool = Form(False)):
    """
    features: JSON string for features dict or comma-separated list
    """
    import json
    try:
        content = await file.read()
        if MODELS_DICT is None:
            raise HTTPException(status_code=500, detail="Models not loaded.")
        # parse features
        try:
            parsed = json.loads(features)
        except Exception:
            # try comma-separated numbers
            parts = features.split(',')
            parsed = [float(x) for x in parts]
        result = predict_multimodal(MODELS_DICT, content, parsed, return_shap=return_shap)
        return result
    except Exception as exc:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(exc))


if __name__ == "__main__":
    uvicorn.run("backend.server:app", host="0.0.0.0", port=8000, reload=True)
