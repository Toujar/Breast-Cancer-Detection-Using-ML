#!/usr/bin/env python3
"""
Production startup script for Render deployment
Optimized for 512MB memory limit
"""

import os
import uvicorn

# Render automatically sets PORT environment variable
port = int(os.environ.get("PORT", 10000))

print("=" * 60)
print("🚀 Starting Memory-Optimized Backend")
print("=" * 60)
print(f"🌐 Port: {port}")
print("💾 Memory: Optimized for 512MB limit")
print("� LPazy loading: Enabled")
print("� Gratd-CAM/SHAP: Disabled for memory")
print("=" * 60)

if __name__ == "__main__":
    uvicorn.run(
        "backend.api:app",
        host="0.0.0.0",
        port=port,
        reload=False,    # MUST be False for production
        workers=1,       # MUST be 1 for memory optimization
        log_level="info"
    )