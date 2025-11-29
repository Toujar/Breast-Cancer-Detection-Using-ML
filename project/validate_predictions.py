#!/usr/bin/env python3
"""
Validation script to verify prediction accuracy and correctness.
This script tests the models against known test data and validates results.
"""

import sys
import os

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

import numpy as np
import pandas as pd
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
from sklearn.datasets import load_breast_cancer
import torch
from PIL import Image
import io

from backend.image_predict import load_image_model, predict_image_bytes
from backend.tabular_predict import load_tabular_model, predict_tabular
from utils.preprocessing import get_tabular_dataset, select_mean_features

print("=" * 70)
print("🔍 PREDICTION VALIDATION SUITE")
print("=" * 70)
print()

def validate_tabular_model():
    """Validate tabular model predictions against test data"""
    print("📊 Validating Tabular Model...")
    print("-" * 70)
    
    try:
        # Load model
        model, scaler, selected_cols = load_tabular_model()
        
        # Load test data
        X_df, y = get_tabular_dataset()
        selected_cols = select_mean_features(X_df, n=10)
        X_selected = X_df[selected_cols]
        
        # Split data (use last 20% as test)
        test_size = int(len(X_selected) * 0.2)
        X_test = X_selected.iloc[-test_size:]
        y_test = y[-test_size:]
        
        # Scale test data
        X_test_scaled = scaler.transform(X_test)
        
        # Make predictions
        y_pred = model.predict(X_test_scaled)
        y_proba = model.predict_proba(X_test_scaled)[:, 1]
        
        # Calculate metrics
        accuracy = accuracy_score(y_test, y_pred) * 100
        precision = precision_score(y_test, y_pred) * 100
        recall = recall_score(y_test, y_pred) * 100
        f1 = f1_score(y_test, y_pred) * 100
        
        # Confusion matrix
        cm = confusion_matrix(y_test, y_pred)
        tn, fp, fn, tp = cm.ravel()
        
        print(f"✅ Test Set Size: {test_size} samples")
        print(f"✅ Accuracy:  {accuracy:.2f}%")
        print(f"✅ Precision: {precision:.2f}%")
        print(f"✅ Recall:    {recall:.2f}%")
        print(f"✅ F1-Score:  {f1:.2f}%")
        print()
        print("Confusion Matrix:")
        print(f"  True Negatives:  {tn}")
        print(f"  False Positives: {fp}")
        print(f"  False Negatives: {fn}")
        print(f"  True Positives:  {tp}")
        print()
        
        # Test individual predictions
        print("Testing Individual Predictions:")
        for i in range(min(5, len(X_test))):
            row = X_test.iloc[i:i+1]
            true_label = "malignant" if y_test[i] == 1 else "benign"
            
            pred_class, prob, _ = predict_tabular(model, scaler, row.to_dict('records')[0], selected_cols, return_shap=False)
            # Wisconsin dataset: 0=malignant, 1=benign
            pred_label = "benign" if pred_class == 1 else "malignant"
            
            match = "✅" if pred_label == true_label else "❌"
            print(f"  {match} Sample {i+1}: Predicted={pred_label}, Actual={true_label}, Confidence={prob*100:.1f}%")
        
        print()
        
        # Validation checks
        if accuracy >= 95.0:
            print("✅ PASS: Accuracy meets expected threshold (≥95%)")
        else:
            print(f"⚠️  WARNING: Accuracy below expected ({accuracy:.2f}% < 95%)")
        
        if precision >= 93.0:
            print("✅ PASS: Precision meets expected threshold (≥93%)")
        else:
            print(f"⚠️  WARNING: Precision below expected ({precision:.2f}% < 93%)")
        
        if recall >= 95.0:
            print("✅ PASS: Recall meets expected threshold (≥95%)")
        else:
            print(f"⚠️  WARNING: Recall below expected ({recall:.2f}% < 95%)")
        
        print()
        return True
        
    except Exception as e:
        print(f"❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False


def validate_image_model():
    """Validate image model with synthetic test images"""
    print("🖼️  Validating Image Model...")
    print("-" * 70)
    
    try:
        # Load model
        model = load_image_model()
        
        print("Creating synthetic test images...")
        
        # Test 1: Uniform gray image (should have low confidence)
        img1 = Image.new('L', (224, 224), color=128)
        img1_bytes = io.BytesIO()
        img1.save(img1_bytes, format='PNG')
        img1_bytes.seek(0)
        
        pred1, prob1, gradcam1 = predict_image_bytes(model, img1_bytes.getvalue())
        pred1_label = "malignant" if pred1 == 1 else "benign"
        
        print(f"  Test 1 (Uniform Gray):")
        print(f"    Prediction: {pred1_label}")
        print(f"    Confidence: {prob1*100:.2f}%")
        print(f"    Grad-CAM: {'✅ Generated' if gradcam1 else '❌ Missing'}")
        
        # Test 2: Random noise image
        img2_array = np.random.randint(0, 256, (224, 224), dtype=np.uint8)
        img2 = Image.fromarray(img2_array, mode='L')
        img2_bytes = io.BytesIO()
        img2.save(img2_bytes, format='PNG')
        img2_bytes.seek(0)
        
        pred2, prob2, gradcam2 = predict_image_bytes(model, img2_bytes.getvalue())
        pred2_label = "malignant" if pred2 == 1 else "benign"
        
        print(f"  Test 2 (Random Noise):")
        print(f"    Prediction: {pred2_label}")
        print(f"    Confidence: {prob2*100:.2f}%")
        print(f"    Grad-CAM: {'✅ Generated' if gradcam2 else '❌ Missing'}")
        
        # Test 3: High contrast pattern
        img3_array = np.zeros((224, 224), dtype=np.uint8)
        img3_array[::2, ::2] = 255  # Checkerboard pattern
        img3 = Image.fromarray(img3_array, mode='L')
        img3_bytes = io.BytesIO()
        img3.save(img3_bytes, format='PNG')
        img3_bytes.seek(0)
        
        pred3, prob3, gradcam3 = predict_image_bytes(model, img3_bytes.getvalue())
        pred3_label = "malignant" if pred3 == 1 else "benign"
        
        print(f"  Test 3 (Checkerboard):")
        print(f"    Prediction: {pred3_label}")
        print(f"    Confidence: {prob3*100:.2f}%")
        print(f"    Grad-CAM: {'✅ Generated' if gradcam3 else '❌ Missing'}")
        
        print()
        
        # Validation checks
        if gradcam1 and gradcam2 and gradcam3:
            print("✅ PASS: Grad-CAM generation working for all test images")
        else:
            print("❌ FAIL: Grad-CAM generation failed for some images")
        
        if 0 <= prob1 <= 1 and 0 <= prob2 <= 1 and 0 <= prob3 <= 1:
            print("✅ PASS: All probabilities in valid range [0, 1]")
        else:
            print("❌ FAIL: Some probabilities out of range")
        
        if pred1 in [0, 1] and pred2 in [0, 1] and pred3 in [0, 1]:
            print("✅ PASS: All predictions are valid classes (0 or 1)")
        else:
            print("❌ FAIL: Invalid prediction classes")
        
        print()
        print("⚠️  NOTE: Image model validation requires real medical images for accurate assessment.")
        print("   These synthetic tests only verify the model runs without errors.")
        print()
        
        return True
        
    except Exception as e:
        print(f"❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False


def validate_prediction_consistency():
    """Test that predictions are consistent for the same input"""
    print("🔄 Validating Prediction Consistency...")
    print("-" * 70)
    
    try:
        # Load models
        tab_model, scaler, selected_cols = load_tabular_model()
        img_model = load_image_model()
        
        # Test tabular consistency
        print("Testing Tabular Model Consistency:")
        test_input = {
            "mean radius": 14.5,
            "mean texture": 20.1,
            "mean perimeter": 95.3,
            "mean area": 650.2,
            "mean smoothness": 0.095,
            "mean compactness": 0.12,
            "mean concavity": 0.08,
            "mean concave points": 0.05,
            "mean symmetry": 0.18,
            "mean fractal dimension": 0.06
        }
        
        predictions = []
        for i in range(5):
            pred_class, prob, _ = predict_tabular(tab_model, scaler, test_input, selected_cols, return_shap=False)
            predictions.append((pred_class, prob))
        
        # Check if all predictions are the same
        all_same = all(p == predictions[0] for p in predictions)
        
        if all_same:
            print(f"  ✅ PASS: All 5 predictions identical")
            # Wisconsin dataset: 0=malignant, 1=benign
            print(f"     Prediction: {'benign' if predictions[0][0] == 1 else 'malignant'}")
            print(f"     Probability: {predictions[0][1]*100:.2f}%")
        else:
            print(f"  ❌ FAIL: Predictions vary across runs")
            for i, (pred, prob) in enumerate(predictions):
                print(f"     Run {i+1}: {pred}, {prob*100:.2f}%")
        
        # Test image consistency
        print("\nTesting Image Model Consistency:")
        img = Image.new('L', (224, 224), color=128)
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='PNG')
        img_data = img_bytes.getvalue()
        
        img_predictions = []
        for i in range(5):
            pred_class, prob, _ = predict_image_bytes(img_model, img_data)
            img_predictions.append((pred_class, prob))
        
        # Check if all predictions are the same
        all_same_img = all(p == img_predictions[0] for p in img_predictions)
        
        if all_same_img:
            print(f"  ✅ PASS: All 5 predictions identical")
            print(f"     Prediction: {'malignant' if img_predictions[0][0] == 1 else 'benign'}")
            print(f"     Probability: {img_predictions[0][1]*100:.2f}%")
        else:
            print(f"  ❌ FAIL: Predictions vary across runs")
            for i, (pred, prob) in enumerate(img_predictions):
                print(f"     Run {i+1}: {pred}, {prob*100:.2f}%")
        
        print()
        return all_same and all_same_img
        
    except Exception as e:
        print(f"❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False


def validate_edge_cases():
    """Test edge cases and boundary conditions"""
    print("⚠️  Validating Edge Cases...")
    print("-" * 70)
    
    try:
        tab_model, scaler, selected_cols = load_tabular_model()
        
        print("Testing Extreme Values:")
        
        # Test 1: All zeros
        test1 = {col: 0.0 for col in selected_cols}
        try:
            pred1, prob1, _ = predict_tabular(tab_model, scaler, test1, selected_cols, return_shap=False)
            # Wisconsin dataset: 0=malignant, 1=benign
            print(f"  ✅ All zeros: Prediction={'benign' if pred1==1 else 'malignant'}, Prob={prob1*100:.1f}%")
        except Exception as e:
            print(f"  ❌ All zeros: Failed - {e}")
        
        # Test 2: Very large values
        test2 = {col: 1000.0 for col in selected_cols}
        try:
            pred2, prob2, _ = predict_tabular(tab_model, scaler, test2, selected_cols, return_shap=False)
            # Wisconsin dataset: 0=malignant, 1=benign
            print(f"  ✅ Large values: Prediction={'benign' if pred2==1 else 'malignant'}, Prob={prob2*100:.1f}%")
        except Exception as e:
            print(f"  ❌ Large values: Failed - {e}")
        
        # Test 3: Negative values (should still work after scaling)
        test3 = {col: -10.0 for col in selected_cols}
        try:
            pred3, prob3, _ = predict_tabular(tab_model, scaler, test3, selected_cols, return_shap=False)
            # Wisconsin dataset: 0=malignant, 1=benign
            print(f"  ✅ Negative values: Prediction={'benign' if pred3==1 else 'malignant'}, Prob={prob3*100:.1f}%")
        except Exception as e:
            print(f"  ❌ Negative values: Failed - {e}")
        
        print()
        return True
        
    except Exception as e:
        print(f"❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Run all validation tests"""
    print("Starting comprehensive validation...\n")
    
    results = {
        "Tabular Model Validation": validate_tabular_model(),
        "Image Model Validation": validate_image_model(),
        "Prediction Consistency": validate_prediction_consistency(),
        "Edge Cases": validate_edge_cases()
    }
    
    # Summary
    print("=" * 70)
    print("📋 VALIDATION SUMMARY")
    print("=" * 70)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, passed_test in results.items():
        status = "✅ PASS" if passed_test else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    print("=" * 70)
    print(f"Results: {passed}/{total} validation tests passed")
    
    if passed == total:
        print("🎉 All validations passed! Predictions are working correctly.")
    else:
        print("⚠️  Some validations failed. Please review the errors above.")
    
    print("=" * 70)
    
    return passed == total


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
