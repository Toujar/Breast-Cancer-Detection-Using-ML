#!/usr/bin/env python3
"""
Simple script to compare model predictions with known ground truth.
Useful for quick verification of prediction accuracy.
"""

import sys
import os

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from sklearn.datasets import load_breast_cancer
import pandas as pd
from backend.tabular_predict import load_tabular_model, predict_tabular
from utils.preprocessing import select_mean_features

def compare_predictions():
    """Compare predictions with ground truth from Wisconsin dataset"""
    
    print("=" * 70)
    print("🔬 PREDICTION COMPARISON TEST")
    print("=" * 70)
    print()
    
    # Load the Wisconsin Breast Cancer dataset
    print("Loading Wisconsin Breast Cancer Dataset...")
    data = load_breast_cancer()
    X = pd.DataFrame(data.data, columns=data.feature_names)
    y = data.target  # 0 = malignant, 1 = benign
    
    print(f"✅ Loaded {len(X)} samples")
    print(f"   - Malignant: {(y == 0).sum()}")
    print(f"   - Benign: {(y == 1).sum()}")
    print()
    
    # Load model
    print("Loading trained model...")
    model, scaler, selected_cols = load_tabular_model()
    selected_cols = select_mean_features(X, n=10)
    print(f"✅ Model loaded")
    print(f"   Using features: {', '.join(selected_cols)}")
    print()
    
    # Test on a few samples
    print("=" * 70)
    print("TESTING INDIVIDUAL SAMPLES")
    print("=" * 70)
    print()
    
    # Get some benign samples
    benign_indices = [i for i, label in enumerate(y) if label == 1][:3]
    
    # Get some malignant samples
    malignant_indices = [i for i, label in enumerate(y) if label == 0][:3]
    
    correct = 0
    total = 0
    
    print("BENIGN SAMPLES (Should predict 'benign'):")
    print("-" * 70)
    for idx in benign_indices:
        sample = X.iloc[idx][selected_cols].to_dict()
        pred_class, prob, _ = predict_tabular(model, scaler, sample, selected_cols, return_shap=False)
        
        # Wisconsin dataset: 0=malignant, 1=benign
        pred_label = "benign" if pred_class == 1 else "malignant"
        true_label = "benign"
        
        match = "✅ CORRECT" if pred_label == true_label else "❌ WRONG"
        correct += (pred_label == true_label)
        total += 1
        
        print(f"Sample {idx}:")
        print(f"  True Label:     {true_label}")
        print(f"  Predicted:      {pred_label}")
        print(f"  Confidence:     {prob*100:.2f}%")
        print(f"  Result:         {match}")
        print()
    
    print("MALIGNANT SAMPLES (Should predict 'malignant'):")
    print("-" * 70)
    for idx in malignant_indices:
        sample = X.iloc[idx][selected_cols].to_dict()
        pred_class, prob, _ = predict_tabular(model, scaler, sample, selected_cols, return_shap=False)
        
        # Wisconsin dataset: 0=malignant, 1=benign
        pred_label = "benign" if pred_class == 1 else "malignant"
        true_label = "malignant"
        
        match = "✅ CORRECT" if pred_label == true_label else "❌ WRONG"
        correct += (pred_label == true_label)
        total += 1
        
        print(f"Sample {idx}:")
        print(f"  True Label:     {true_label}")
        print(f"  Predicted:      {pred_label}")
        print(f"  Confidence:     {prob*100:.2f}%")
        print(f"  Result:         {match}")
        print()
    
    # Summary
    print("=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print(f"Correct Predictions: {correct}/{total}")
    print(f"Accuracy: {correct/total*100:.1f}%")
    print()
    
    if correct == total:
        print("🎉 Perfect! All test samples predicted correctly!")
    elif correct >= total * 0.8:
        print("✅ Good! Most samples predicted correctly.")
    else:
        print("⚠️  Warning: Many incorrect predictions. Model may need retraining.")
    
    print()
    print("=" * 70)
    print("DETAILED SAMPLE DATA")
    print("=" * 70)
    print()
    print("Example Benign Sample Features:")
    benign_sample = X.iloc[benign_indices[0]][selected_cols]
    for feature, value in benign_sample.items():
        print(f"  {feature}: {value:.4f}")
    
    print()
    print("Example Malignant Sample Features:")
    malignant_sample = X.iloc[malignant_indices[0]][selected_cols]
    for feature, value in malignant_sample.items():
        print(f"  {feature}: {value:.4f}")
    
    print()
    print("=" * 70)
    print("KEY DIFFERENCES")
    print("=" * 70)
    print()
    print("Typical patterns:")
    print("  Benign tumors:")
    print("    - Smaller radius, perimeter, area")
    print("    - Lower texture variation")
    print("    - Smoother boundaries")
    print("    - More symmetric")
    print()
    print("  Malignant tumors:")
    print("    - Larger radius, perimeter, area")
    print("    - Higher texture variation")
    print("    - Irregular boundaries (higher concavity)")
    print("    - Less symmetric")
    print()
    
    return correct == total


if __name__ == "__main__":
    try:
        success = compare_predictions()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
