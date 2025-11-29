# project/training/evaluate.py
"""
Common evaluation utilities for both image and tabular models.
Generates metrics (ROC, confusion matrix) and prints them.
"""

from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix
import matplotlib.pyplot as plt
import numpy as np
import os

def print_classification_metrics(y_true, y_pred, y_probs=None):
    acc = accuracy_score(y_true, y_pred)
    prec = precision_score(y_true, y_pred, zero_division=0)
    rec = recall_score(y_true, y_pred, zero_division=0)
    f1 = f1_score(y_true, y_pred, zero_division=0)
    print(f"Acc: {acc:.4f} Prec: {prec:.4f} Rec: {rec:.4f} F1: {f1:.4f}")
    if y_probs is not None:
        try:
            auc = roc_auc_score(y_true, y_probs)
            print(f"AUC: {auc:.4f}")
        except:
            print("AUC could not be computed.")

def save_roc_and_confusion(y_true, y_pred, y_probs, out_prefix):
    from sklearn.metrics import roc_curve, auc, confusion_matrix
    fpr, tpr, _ = roc_curve(y_true, y_probs)
    roc_auc = auc(fpr, tpr)
    plt.figure()
    plt.plot(fpr, tpr, label=f'AUC = {roc_auc:.4f}')
    plt.plot([0,1],[0,1],'--')
    plt.legend()
    plt.title('ROC')
    plt.savefig(out_prefix + '_roc.png')
    plt.close()

    cm = confusion_matrix(y_true, y_pred)
    plt.figure(figsize=(4,4))
    plt.imshow(cm, cmap='Blues')
    plt.title('Confusion Matrix')
    plt.colorbar()
    plt.xlabel('Predicted')
    plt.ylabel('Actual')
    plt.savefig(out_prefix + '_confusion.png')
    plt.close()
