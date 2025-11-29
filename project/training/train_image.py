# project/training/train_image.py
"""
Train DenseNet121 on BreastMNIST (medmnist). Saves model .pth and .onnx and metric plots.
"""
import sys
import os

# Add project root to PYTHONPATH
ROOT_DIR = os.path.dirname(os.path.dirname(__file__))
sys.path.append(ROOT_DIR)



import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
import os
from tqdm import tqdm
import numpy as np
import matplotlib.pyplot as plt

# medmnist dataset
from medmnist import BreastMNIST
from medmnist import INFO

from torchvision import models
from utils.preprocessing import get_image_transforms, IMG_SIZE
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix

# ensure models dir exists
MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models')
os.makedirs(MODELS_DIR, exist_ok=True)

def prepare_dataloaders(batch_size=32):
    data_flag = 'breastmnist'
    info = INFO[data_flag]
    DataClass = BreastMNIST

    train_transform = get_image_transforms(train=True)
    val_transform = get_image_transforms(train=False)

    train_dataset = DataClass(split='train', transform=train_transform, download=True)
    val_dataset = DataClass(split='val', transform=val_transform, download=True)

    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=4, pin_memory=True)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=4, pin_memory=True)
    return train_loader, val_loader, info

def build_model(num_classes=2, device='cuda'):
    # Load pretrained DenseNet121 and adapt first conv for 1-channel
    model = models.densenet121(pretrained=True)
    # modify features.conv0 to accept 1 channel (original is 3)
    old_conv = model.features.conv0
    new_conv = nn.Conv2d(1, old_conv.out_channels, kernel_size=old_conv.kernel_size,
                         stride=old_conv.stride, padding=old_conv.padding, bias=False)
    # average weights across channels
    with torch.no_grad():
        new_conv.weight[:] = old_conv.weight.mean(dim=1, keepdim=True)
    model.features.conv0 = new_conv
    # modify classifier
    model.classifier = nn.Linear(model.classifier.in_features, num_classes)
    return model.to(device)

def train_one_epoch(model, loader, criterion, optimizer, device):
    model.train()
    losses = []
    preds, trues = [], []
    pbar = tqdm(loader, desc='train')
    for x, y in pbar:
        x = x.to(device)  # medmnist returns shape [B,1,H,W]
        y = y.squeeze().long().to(device)
        optimizer.zero_grad()
        out = model(x)
        loss = criterion(out, y)
        loss.backward()
        optimizer.step()
        losses.append(loss.item())
        preds.extend(out.argmax(dim=1).cpu().numpy().tolist())
        trues.extend(y.cpu().numpy().tolist())
    return np.mean(losses), preds, trues

def validate(model, loader, criterion, device):
    model.eval()
    losses = []
    preds, trues, probs = [], [], []
    with torch.no_grad():
        for x, y in loader:
            x = x.to(device)
            y = y.squeeze().long().to(device)
            out = model(x)
            loss = criterion(out, y)
            probs.extend(torch.softmax(out, dim=1)[:,1].cpu().numpy().tolist())  # positive class prob
            preds.extend(out.argmax(dim=1).cpu().numpy().tolist())
            trues.extend(y.cpu().numpy().tolist())
            losses.append(loss.item())
    return np.mean(losses), preds, trues, probs

def save_metrics_plots(y_true, y_pred, probs, out_prefix):
    from sklearn.metrics import roc_curve, auc, confusion_matrix
    # ROC
    fpr, tpr, _ = roc_curve(y_true, probs)
    roc_auc = auc(fpr, tpr)
    plt.figure()
    plt.plot(fpr, tpr, label=f'AUC = {roc_auc:.4f}')
    plt.plot([0,1],[0,1],'--')
    plt.legend()
    plt.title('ROC')
    plt.savefig(out_prefix + '_roc.png')
    plt.close()
    # Confusion matrix
    cm = confusion_matrix(y_true, y_pred)
    plt.figure(figsize=(4,4))
    plt.imshow(cm, cmap='Blues')
    plt.title('Confusion Matrix')
    plt.colorbar()
    plt.xlabel('Predicted')
    plt.ylabel('Actual')
    plt.savefig(out_prefix + '_confusion.png')
    plt.close()

def train_main(epochs=10, batch_size=32, lr=1e-4, device=None):
    device = device or ('cuda' if torch.cuda.is_available() else 'cpu')
    train_loader, val_loader, info = prepare_dataloaders(batch_size=batch_size)
    model = build_model(num_classes=2, device=device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=lr)
    best_val_f1 = 0.0
    best_path = os.path.join(MODELS_DIR, 'image_model.pth')

    for epoch in range(1, epochs+1):
        print(f"Epoch {epoch}/{epochs} - device={device}")
        train_loss, train_preds, train_trues = train_one_epoch(model, train_loader, criterion, optimizer, device)
        val_loss, val_preds, val_trues, val_probs = validate(model, val_loader, criterion, device)

        # metrics
        acc = accuracy_score(val_trues, val_preds)
        prec = precision_score(val_trues, val_preds, zero_division=0)
        rec = recall_score(val_trues, val_preds, zero_division=0)
        f1 = f1_score(val_trues, val_preds, zero_division=0)
        try:
            auc_score = roc_auc_score(val_trues, val_probs)
        except:
            auc_score = 0.0

        print(f"Train loss: {train_loss:.4f} | Val loss: {val_loss:.4f}")
        print(f"Val Acc: {acc:.4f} Prec: {prec:.4f} Rec: {rec:.4f} F1: {f1:.4f} AUC: {auc_score:.4f}")

        # save best
        if f1 > best_val_f1:
            print("New best F1 -> saving model")
            best_val_f1 = f1
            torch.save({'model_state_dict': model.state_dict()}, best_path)
            # also export ONNX
            export_onnx(model, os.path.join(MODELS_DIR, 'image_model.onnx'), device)

    # final metrics plots on val set
    save_metrics_plots(val_trues, val_preds, val_probs, os.path.join(MODELS_DIR, 'image_metrics'))
    print(f"Training complete. Best F1: {best_val_f1:.4f}. Model saved to {best_path}")

def export_onnx(model, out_path, device):
    model.eval()

    dummy = torch.randn(1, 1, 224, 224).to(device)

    try:
        print("\n🔥 Exporting ONNX with new PyTorch exporter (opset=18)...")
        torch.onnx.export(
            model,
            dummy,
            out_path,
            input_names=['input'],
            output_names=['output'],
            opset_version=18,           # ← REQUIRED for new exporter
            dynamic_shapes=False,       # ← must disable deprecated dynamic_axes
            do_constant_folding=True
        )
        print("✅ Successfully exported ONNX model:", out_path)

    except Exception as e:
        print("\n❗ New exporter failed. Falling back to legacy exporter...\n", e)

        torch.onnx.export(
            model,
            dummy,
            out_path,
            input_names=['input'],
            output_names=['output'],
            opset_version=12,
            operator_export_type=torch.onnx.OperatorExportTypes.ONNX,
            do_constant_folding=True
        )
        print("✅ Fallback ONNX export succeeded:", out_path)

if __name__ == "__main__":
    # quick CLI entrypoint
    train_main(epochs=6, batch_size=64, lr=1e-4)
