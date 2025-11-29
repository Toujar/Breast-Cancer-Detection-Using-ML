#!/usr/bin/env python3
"""
Test script for the new backend API.
Tests all endpoints and verifies responses.
"""

import sys
import os
import requests
import json
from io import BytesIO
from PIL import Image
import numpy as np

# Configuration
BASE_URL = "http://localhost:8000"

def create_test_image():
    """Create a dummy grayscale test image"""
    img = Image.new('L', (224, 224), color=128)
    # Add some random noise
    pixels = np.array(img)
    noise = np.random.randint(0, 50, pixels.shape, dtype=np.uint8)
    pixels = np.clip(pixels + noise, 0, 255).astype(np.uint8)
    img = Image.fromarray(pixels)
    
    # Save to bytes
    img_bytes = BytesIO()
    img.save(img_bytes, format='PNG')
    img_bytes.seek(0)
    return img_bytes

def test_health_check():
    """Test the health check endpoint"""
    print("\n" + "="*60)
    print("🏥 Testing Health Check Endpoint")
    print("="*60)
    
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Server is online")
            print(f"   Version: {data.get('version')}")
            print(f"   Models loaded:")
            for model_type, loaded in data.get('models', {}).items():
                status = "✅" if loaded else "❌"
                print(f"      {status} {model_type}")
            return True
        else:
            print("❌ Server returned error")
            return False
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return False

def test_image_prediction():
    """Test image prediction endpoint"""
    print("\n" + "="*60)
    print("🖼️  Testing Image Prediction Endpoint")
    print("="*60)
    
    try:
        # Create test image
        img_bytes = create_test_image()
        
        # Send request
        files = {'file': ('test.png', img_bytes, 'image/png')}
        data = {'return_gradcam': 'true'}
        
        response = requests.post(
            f"{BASE_URL}/predict/image",
            files=files,
            data=data
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Prediction successful")
            print(f"   Prediction: {result.get('prediction')}")
            print(f"   Confidence: {result.get('confidence')}%")
            print(f"   Grad-CAM: {'✅ Included' if result.get('gradcam') else '❌ Missing'}")
            print(f"   Metrics:")
            metrics = result.get('metrics', {})
            print(f"      Accuracy: {metrics.get('accuracy')}%")
            print(f"      Precision: {metrics.get('precision')}%")
            print(f"      Recall: {metrics.get('recall')}%")
            print(f"      F1-Score: {metrics.get('f1Score')}%")
            print(f"      Algorithm: {metrics.get('algorithm')}")
            return True
        else:
            print(f"❌ Prediction failed: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

def test_tabular_prediction():
    """Test tabular prediction endpoint"""
    print("\n" + "="*60)
    print("📊 Testing Tabular Prediction Endpoint")
    print("="*60)
    
    try:
        # Test data (sample breast cancer features)
        payload = {
            "radius_mean": 14.5,
            "texture_mean": 20.1,
            "perimeter_mean": 95.3,
            "area_mean": 650.2,
            "smoothness_mean": 0.095,
            "compactness_mean": 0.12,
            "concavity_mean": 0.08,
            "concave_points_mean": 0.05,
            "symmetry_mean": 0.18,
            "fractal_dimension_mean": 0.06,
            "return_shap": False
        }
        
        response = requests.post(
            f"{BASE_URL}/predict/tabular",
            json=payload
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Prediction successful")
            print(f"   Prediction: {result.get('prediction')}")
            print(f"   Confidence: {result.get('confidence')}%")
            print(f"   SHAP: {'✅ Included' if result.get('shap') else '⚠️  Not requested'}")
            print(f"   Metrics:")
            metrics = result.get('metrics', {})
            print(f"      Accuracy: {metrics.get('accuracy')}%")
            print(f"      Precision: {metrics.get('precision')}%")
            print(f"      Recall: {metrics.get('recall')}%")
            print(f"      F1-Score: {metrics.get('f1Score')}%")
            print(f"      Algorithm: {metrics.get('algorithm')}")
            return True
        else:
            print(f"❌ Prediction failed: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

def test_multimodal_prediction():
    """Test multimodal prediction endpoint"""
    print("\n" + "="*60)
    print("🔬 Testing Multimodal Prediction Endpoint")
    print("="*60)
    
    try:
        # Create test image
        img_bytes = create_test_image()
        
        # Test features
        features = {
            "radius_mean": 14.5,
            "texture_mean": 20.1,
            "perimeter_mean": 95.3,
            "area_mean": 650.2,
            "smoothness_mean": 0.095,
            "compactness_mean": 0.12,
            "concavity_mean": 0.08,
            "concave_points_mean": 0.05,
            "symmetry_mean": 0.18,
            "fractal_dimension_mean": 0.06
        }
        
        # Send request
        files = {'file': ('test.png', img_bytes, 'image/png')}
        data = {
            'features': json.dumps(features),
            'return_shap': 'false'
        }
        
        response = requests.post(
            f"{BASE_URL}/predict/multimodal",
            files=files,
            data=data
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Prediction successful")
            print(f"   Prediction: {result.get('prediction')}")
            print(f"   Combined Confidence: {result.get('confidence')}%")
            print(f"   Image Confidence: {result.get('image_confidence')}%")
            print(f"   Tabular Confidence: {result.get('tabular_confidence')}%")
            print(f"   Grad-CAM: {'✅ Included' if result.get('gradcam') else '❌ Missing'}")
            print(f"   SHAP: {'✅ Included' if result.get('shap') else '⚠️  Not requested'}")
            print(f"   Metrics:")
            metrics = result.get('metrics', {})
            print(f"      Accuracy: {metrics.get('accuracy')}%")
            print(f"      Algorithm: {metrics.get('algorithm')}")
            return True
        else:
            print(f"❌ Prediction failed: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("🧪 BACKEND API TEST SUITE")
    print("="*60)
    print(f"Testing server at: {BASE_URL}")
    
    results = {
        "Health Check": test_health_check(),
        "Image Prediction": test_image_prediction(),
        "Tabular Prediction": test_tabular_prediction(),
        "Multimodal Prediction": test_multimodal_prediction()
    }
    
    # Summary
    print("\n" + "="*60)
    print("📋 TEST SUMMARY")
    print("="*60)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, passed_test in results.items():
        status = "✅ PASS" if passed_test else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    print("="*60)
    print(f"Results: {passed}/{total} tests passed")
    print("="*60)
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
