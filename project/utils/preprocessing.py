# project/utils/preprocessing.py
"""
Image and Tabular preprocessing utilities.

- Image transforms: resize, normalization for DenseNet121-style inputs (we adapt 1-channel -> mean/std)
- Tabular preprocessing: select mean features, scaling helpers
"""

from torchvision import transforms
from PIL import Image
import numpy as np
import io
import pickle

# Image transform constants
IMG_SIZE = 224

def get_image_transforms(train: bool = True):
    """
    Returns torchvision transforms for training/validation.
    For training: include augmentation.
    For validation: only deterministic transforms.
    """
    if train:
        return transforms.Compose([
            transforms.Resize((IMG_SIZE, IMG_SIZE)),
            transforms.RandomHorizontalFlip(),
            transforms.RandomRotation(15),
            transforms.ColorJitter(brightness=0.1, contrast=0.1),  # doesn't fail on 1-channel
            transforms.ToTensor(),  # will be 1 x H x W for grayscale
            transforms.Normalize(mean=[0.5], std=[0.5])  # scale to approx [-1,1]
        ])
    else:
        return transforms.Compose([
            transforms.Resize((IMG_SIZE, IMG_SIZE)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.5], std=[0.5])
        ])


def pil_image_from_bytes(bytestr: bytes) -> Image.Image:
    """Converts bytes (uploaded file) to PIL Image in grayscale."""
    img = Image.open(io.BytesIO(bytestr)).convert('L')  # single channel
    return img

def image_bytes_to_tensor(bytestr: bytes, train: bool = False):
    """Helper: bytes -> preprocessed tensor (unsqueezed batch dimension)."""
    img = pil_image_from_bytes(bytestr)
    transform = get_image_transforms(train=train)
    tensor = transform(img)  # shape: [1, H, W]
    return tensor.unsqueeze(0)  # make batch dim [1,1,H,W]


# Tabular utils
from sklearn.preprocessing import StandardScaler
from sklearn.datasets import load_breast_cancer
import pandas as pd

def get_tabular_dataset():
    """
    Loads sklearn's breast cancer dataset as a DataFrame.
    Returns: X_df, y
    """
    ds = load_breast_cancer()
    X = pd.DataFrame(ds.data, columns=ds.feature_names)
    y = ds.target
    return X, y

def select_mean_features(X_df, n=10):
    """
    Selects the first n features whose names contain 'mean'.
    This matches the instruction: "Select the 10 'mean' features".
    """
    mean_cols = [c for c in X_df.columns if 'mean' in c]
    selected = mean_cols[:n]
    if len(selected) < n:
        # fallback: take top n columns
        selected = list(X_df.columns[:n])
    return selected

def save_scaler(scaler: StandardScaler, path: str):
    with open(path, 'wb') as f:
        pickle.dump(scaler, f)

def load_scaler(path: str) -> StandardScaler:
    with open(path, 'rb') as f:
        return pickle.load(f)
