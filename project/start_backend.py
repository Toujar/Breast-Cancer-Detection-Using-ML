#!/usr/bin/env python3
"""
Startup script for the new breast cancer detection backend.
This script ensures proper environment setup and starts the FastAPI server.
"""

import sys
import os

# Add project root to Python path
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

print("=" * 60)
print("🚀 Starting Breast Cancer Detection Backend")
print("=" * 60)
print(f"📁 Project Root: {ROOT_DIR}")
print(f"🐍 Python Version: {sys.version}")
print("=" * 60)

# Check if required packages are installed
try:
    import fastapi
    import uvicorn
    import torch
    import torchvision
    import xgboost
    import sklearn
    import PIL
    print("✅ All required packages are installed")
except ImportError as e:
    print(f"❌ Missing package: {e}")
    print("\n📦 Please install requirements:")
    print("   pip install -r requirements.txt")
    sys.exit(1)

# Check if model files exist
models_dir = os.path.join(ROOT_DIR, 'models')
required_models = ['image_model.pth', 'xgboost_model.pkl', 'scaler.pkl']
missing_models = []

for model_file in required_models:
    model_path = os.path.join(models_dir, model_file)
    if os.path.exists(model_path):
        print(f"✅ Found: {model_file}")
    else:
        print(f"❌ Missing: {model_file}")
        missing_models.append(model_file)

if missing_models:
    print("\n⚠️  Warning: Some model files are missing!")
    print("   The server will start but predictions may fail.")
    print("   Please train the models first:")
    print("   - python training/train_image.py")
    print("   - python training/train_tabular.py")
    print()

print("=" * 60)
print("🌐 Starting FastAPI server...")
print("   URL: http://localhost:8000")
print("   Docs: http://localhost:8000/docs")
print("   Health: http://localhost:8000/")
print("=" * 60)
print()

# Start the server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.api:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
