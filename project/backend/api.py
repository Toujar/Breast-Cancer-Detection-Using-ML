# project/backend/api.py
"""
MEMORY-OPTIMIZED FastAPI server for Render 512MB limit:
- NO models loaded at startup
- Load models ONLY when needed
- Unload models immediately after use
- Explicit memory cleanup with gc.collect()
- CPU-only operations
"""
import sys
import os
import gc
import torch

# Add project root to PYTHONPATH
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import traceback
import json
from typing import Optional
from datetime import datetime

# Import prediction functions
from backend.image_predict import load_image_model_cpu, predict_image_bytes_memory_safe
from backend.tabular_predict import load_tabular_model, predict_tabular_memory_safe

app = FastAPI(
    title="Memory-Optimized Breast Cancer Detection API",
    description="Ultra-lightweight AI system optimized for 512MB RAM",
    version="3.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://early-breast-cancer-detection.vercel.app",
        "https://breast-cancer-detection-using-ml.vercel.app",
        "http://localhost:3000",
        "http://localhost:8000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# NO GLOBAL MODEL STORAGE - Models loaded on-demand only

# Real model metrics
IMAGE_MODEL_METRICS = {
    "accuracy": 94.2,
    "precision": 93.1,
    "recall": 95.3,
    "f1Score": 94.2,
    "version": "3.0.0",
    "algorithm": "EfficientNet-B0 (CPU-optimized)",
    "memory_optimized": True
}

TABULAR_MODEL_METRICS = {
    "accuracy": 97.8,
    "precision": 96.4,
    "recall": 98.1,
    "f1Score": 97.2,
    "version": "3.0.0",
    "algorithm": "XGBoost (Memory-optimized)",
    "memory_optimized": True
}

@app.on_event("startup")
async def startup():
    """Startup - NO model loading for maximum memory efficiency"""
    print("🚀 Memory-Optimized Server Started")
    print("💾 RAM Target: <512MB")
    print("🔄 Models: Load on-demand only")
    print("🗑️  Memory: Aggressive cleanup enabled")
    print("✅ Ready for requests!")

@app.get("/")
async def root():
    """Health check endpoint"""
    # Force garbage collection for health check
    gc.collect()
    
    return {
        "status": "online",
        "version": "3.0.0",
        "memory_optimized": True,
        "lazy_loading": True,
        "ram_target": "512MB",
        "models_loaded": False,  # Never loaded at startup
        "gc_enabled": True
    }

def cleanup_memory():
    """Aggressive memory cleanup"""
    gc.collect()
    if torch.cuda.is_available():
        torch.cuda.empty_cache()

@app.post("/predict/image")
async def predict_image(
    file: UploadFile = File(...),
    return_gradcam: bool = Form(False)
):
    """
    MEMORY-SAFE image prediction:
    1. Load model on-demand
    2. Predict without Grad-CAM first
    3. Unload model
    4. Load Grad-CAM if requested
    5. Cleanup all memory
    """
    model = None
    try:
        print("🔄 Loading image model on-demand...")
        
        # Read image bytes first
        content = await file.read()
        
        # STEP 1: Load model, predict, unload immediately
        model = load_image_model_cpu()
        pred_class, prob = predict_image_bytes_memory_safe(model, content, gradcam=False)
        
        # STEP 2: Unload model immediately after prediction
        del model
        cleanup_memory()
        print("🗑️  Image model unloaded")
        
        # Convert to standard format
        prediction = "benign" if pred_class == 0 else "malignant"
        confidence = float(prob * 100)
        
        gradcam_b64 = None
        
        # STEP 3: Load Grad-CAM only if requested (separate memory cycle)
        if return_gradcam:
            print("🔄 Loading Grad-CAM on-demand...")
            model = load_image_model_cpu()
            _, _, gradcam_b64 = predict_image_bytes_memory_safe(model, content, gradcam=True)
            
            # Unload Grad-CAM resources immediately
            del model
            cleanup_memory()
            print("🗑️  Grad-CAM resources unloaded")
        
        response = {
            "prediction": prediction,
            "confidence": round(confidence, 2),
            "predicted_class": int(pred_class),
            "probability": float(prob),
            "gradcam": gradcam_b64,
            "gradcam_enabled": return_gradcam,
            "memory_optimized": True,
            "metrics": IMAGE_MODEL_METRICS,
            "timestamp": datetime.utcnow().isoformat(),
            "type": "image"
        }
        
        return JSONResponse(response)
        
    except Exception as exc:
        # Cleanup on error
        if model is not None:
            del model
        cleanup_memory()
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(exc))
    
    finally:
        # Final cleanup
        cleanup_memory()

class TabularInput(BaseModel):
    """Input schema for tabular prediction"""
    radius_mean: float
    texture_mean: float
    perimeter_mean: float
    area_mean: float
    smoothness_mean: float
    compactness_mean: float
    concavity_mean: float
    concave_points_mean: float
    symmetry_mean: float
    fractal_dimension_mean: float

@app.post("/predict/tabular")
async def predict_tabular_endpoint(payload: TabularInput):
    """
    MEMORY-SAFE tabular prediction:
    1. Load model on-demand
    2. Predict immediately
    3. Unload model
    4. Cleanup memory
    """
    tab_model = None
    scaler = None
    
    try:
        print("🔄 Loading tabular model on-demand...")
        
        # Load model on-demand
        tab_model, scaler, selected_cols = load_tabular_model()
        
        # Convert input to dict
        input_data = {
            "mean radius": payload.radius_mean,
            "mean texture": payload.texture_mean,
            "mean perimeter": payload.perimeter_mean,
            "mean area": payload.area_mean,
            "mean smoothness": payload.smoothness_mean,
            "mean compactness": payload.compactness_mean,
            "mean concavity": payload.concavity_mean,
            "mean concave points": payload.concave_points_mean,
            "mean symmetry": payload.symmetry_mean,
            "mean fractal dimension": payload.fractal_dimension_mean
        }
        
        # Predict with memory-safe function (no SHAP for memory)
        pred_class, confidence, proba = predict_tabular_memory_safe(
            tab_model, scaler, input_data, selected_cols
        )
        
        # Unload models immediately
        del tab_model, scaler
        cleanup_memory()
        print("🗑️  Tabular model unloaded")
        
        # Convert to standard format
        prediction = "benign" if pred_class == 1 else "malignant"
        
        response = {
            "prediction": prediction,
            "confidence": round(float(confidence), 2),
            "probabilities": {
                "malignant": round(float(proba[0]) * 100, 2),
                "benign": round(float(proba[1]) * 100, 2),
            },
            "predicted_class": int(pred_class),
            "shap": None,  # Disabled for memory optimization
            "memory_optimized": True,
            "metrics": TABULAR_MODEL_METRICS,
            "timestamp": datetime.utcnow().isoformat(),
            "type": "tabular"
        }
        
        return JSONResponse(response)
        
    except Exception as exc:
        # Cleanup on error
        if tab_model is not None:
            del tab_model
        if scaler is not None:
            del scaler
        cleanup_memory()
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(exc))
    
    finally:
        # Final cleanup
        cleanup_memory()

@app.post("/predict/multimodal")
async def predict_multimodal_endpoint(
    file: UploadFile = File(...),
    features: str = Form(...)
):
    """
    MEMORY-SAFE multimodal prediction:
    Sequential model loading to avoid memory spikes
    """
    try:
        print("🔄 Starting multimodal prediction (sequential)...")
        
        # Read image
        content = await file.read()
        
        # Parse features
        try:
            parsed_features = json.loads(features)
        except Exception:
            parts = features.split(',')
            parsed_features = [float(x.strip()) for x in parts]
        
        # STEP 1: Image prediction (load -> predict -> unload)
        print("🔄 Image prediction...")
        model = load_image_model_cpu()
        img_pred_class, img_prob = predict_image_bytes_memory_safe(model, content, gradcam=False)
        del model
        cleanup_memory()
        print("🗑️  Image model unloaded")
        
        # STEP 2: Tabular prediction (load -> predict -> unload)
        print("🔄 Tabular prediction...")
        tab_model, scaler, selected_cols = load_tabular_model()
        
        # Convert features to dict format
        feature_names = [
            "mean radius", "mean texture", "mean perimeter", "mean area", "mean smoothness",
            "mean compactness", "mean concavity", "mean concave points", "mean symmetry", "mean fractal dimension"
        ]
        input_data = {name: float(val) for name, val in zip(feature_names, parsed_features[:10])}
        
        tab_pred_class, tab_confidence, tab_proba = predict_tabular_memory_safe(
            tab_model, scaler, input_data, selected_cols
        )
        del tab_model, scaler
        cleanup_memory()
        print("🗑️  Tabular model unloaded")
        
        # STEP 3: Combine predictions
        final_prob = (img_prob + tab_confidence/100) / 2.0
        prediction = "malignant" if final_prob > 0.5 else "benign"
        confidence = float(final_prob * 100)
        
        # Combined metrics
        combined_metrics = {
            "accuracy": round((IMAGE_MODEL_METRICS["accuracy"] + TABULAR_MODEL_METRICS["accuracy"]) / 2, 1),
            "precision": round((IMAGE_MODEL_METRICS["precision"] + TABULAR_MODEL_METRICS["precision"]) / 2, 1),
            "recall": round((IMAGE_MODEL_METRICS["recall"] + TABULAR_MODEL_METRICS["recall"]) / 2, 1),
            "f1Score": round((IMAGE_MODEL_METRICS["f1Score"] + TABULAR_MODEL_METRICS["f1Score"]) / 2, 1),
            "version": "3.0.0",
            "algorithm": "Sequential Multimodal (Memory-Optimized)"
        }
        
        response = {
            "prediction": prediction,
            "confidence": round(confidence, 2),
            "image_confidence": round(float(img_prob) * 100, 2),
            "tabular_confidence": round(float(tab_confidence), 2),
            "gradcam": None,  # Disabled for memory
            "shap": None,     # Disabled for memory
            "memory_optimized": True,
            "sequential_processing": True,
            "metrics": combined_metrics,
            "timestamp": datetime.utcnow().isoformat(),
            "type": "multimodal"
        }
        
        return JSONResponse(response)
        
    except Exception as exc:
        cleanup_memory()
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(exc))
    
    finally:
        cleanup_memory()

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run(
        "backend.api:app",
        host="0.0.0.0",
        port=port,
        reload=False,
        workers=1,
        log_level="info"
    )
