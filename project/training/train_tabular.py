# project/training/train_tabular.py
"""
Train an XGBoost classifier on sklearn breast cancer dataset using 10 mean features.
Saves model (.pkl) and scaler (.pkl) in models/.
"""
import sys
import os

# Add project root to PYTHONPATH
ROOT_DIR = os.path.dirname(os.path.dirname(__file__))
sys.path.append(ROOT_DIR)

import os
import pickle
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix
from xgboost import XGBClassifier
import numpy as np
import joblib
import matplotlib.pyplot as plt

from utils.preprocessing import get_tabular_dataset, select_mean_features

MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models')
os.makedirs(MODELS_DIR, exist_ok=True)

def train_tabular(random_state=42):
    X_df, y = get_tabular_dataset()
    selected_cols = select_mean_features(X_df, n=10)
    X = X_df[selected_cols].values

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=random_state, stratify=y)

    scaler = StandardScaler().fit(X_train)
    X_train_s = scaler.transform(X_train)
    X_test_s = scaler.transform(X_test)

    # XGBoost model with practical hyperparameters
    model = XGBClassifier(
        n_estimators=200,
        max_depth=4,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        use_label_encoder=False,
        eval_metric='logloss',
        random_state=random_state
    )
    model.fit(X_train_s, y_train)

    # evaluate
    y_pred = model.predict(X_test_s)
    y_proba = model.predict_proba(X_test_s)[:,1]
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred)
    rec = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    auc = roc_auc_score(y_test, y_proba)
    cm = confusion_matrix(y_test, y_pred)

    print("Tabular model results:")
    print(f"Acc: {acc:.4f} Prec: {prec:.4f} Rec: {rec:.4f} F1: {f1:.4f} AUC: {auc:.4f}")
    print("Confusion Matrix:")
    print(cm)

    # save model and scaler
    model_path = os.path.join(MODELS_DIR, 'xgboost_model.pkl')
    scaler_path = os.path.join(MODELS_DIR, 'scaler.pkl')
    joblib.dump(model, model_path)
    joblib.dump(scaler, scaler_path)
    print(f"Saved model -> {model_path}")
    print(f"Saved scaler -> {scaler_path}")
    
    # Save metrics as JSON for API to load
    import json
    metrics = {
        "accuracy": float(acc * 100),
        "precision": float(prec * 100),
        "recall": float(rec * 100),
        "f1Score": float(f1 * 100),
 

    # save simple feature importance plot
    plt.figure(figsize=(6,4))
    try:
        importances = model.feature_importances_
        idxs = np.arange(len(importances))
        plt.barh(idxs, importances)
        plt.yticks(idxs, selected_cols)
        plt.title('Feature importances')
        plt.tight_layout()
        plt.savefig(os.path.join(MODELS_DIR, 'tabular_feature_importance.png'))
        plt.close()
    except Exception as e:
        print("Failed to save feature importance:", e)

    return model_path, scaler_path

if __name__ == "__main__":
    train_tabular()
