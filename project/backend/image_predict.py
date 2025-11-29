# # project/backend/image_predict.py
# """
# Image prediction helper: load image model, predict probability and class, and return Grad-CAM heatmap (base64).
# """

# import torch
# import torch.nn.functional as F
# from torchvision import models
# import os
# import io
# import joblib
# from PIL import Image
# import numpy as np

# from utils.preprocessing import image_bytes_to_tensor, pil_image_from_bytes
# from utils.gradcam import GradCAM, overlay_heatmap_on_image, pil_to_base64

# MODELS_DIR = os.path.join(os.path.dirname(__file__), '..', 'models')

# def load_image_model(device=None):
#     device = device or ('cuda' if torch.cuda.is_available() else 'cpu')
#     # build same model architecture then load weights
#     model = models.densenet121(pretrained=True)
#     # adapt first conv to 1-channel
#     import torch.nn as nn
#     old_conv = model.features.conv0
#     new_conv = nn.Conv2d(1, old_conv.out_channels, kernel_size=old_conv.kernel_size,
#                          stride=old_conv.stride, padding=old_conv.padding, bias=False)
#     with torch.no_grad():
#         new_conv.weight[:] = old_conv.weight.mean(dim=1, keepdim=True)
#     model.features.conv0 = new_conv
#     model.classifier = nn.Linear(model.classifier.in_features, 2)
#     # load state_dict
#     ckpt_path = os.path.join(MODELS_DIR, 'image_model.pth')
#     if not os.path.exists(ckpt_path):
#         raise FileNotFoundError(f"Image model checkpoint not found at {ckpt_path}. Please train model first.")
#     data = torch.load(ckpt_path, map_location=device)
#     model.load_state_dict(data['model_state_dict'])
#     model = model.to(device)
#     model.eval()
#     return model

# def predict_image_bytes(model, image_bytes):
#     """
#     Returns:
#         pred_class int (0/1),
#         probability float (positive class prob),
#         gradcam_base64 str
#     """
#     device = next(model.parameters()).device
#     tensor = image_bytes_to_tensor(image_bytes, train=False)  # shape [1,1,H,W]
#     tensor = tensor.to(device)
#     with torch.no_grad():
#         out = model(tensor)
#         probs = torch.softmax(out, dim=1)[:,1].cpu().numpy()
#         pred_class = int(out.argmax(dim=1).item())
#         prob = float(probs[0])

#     # Grad-CAM
#     # For DenseNet121 use model.features.norm5 or model.features.relu? choose model.features.denseblock4
#     target_layer = model.features.denseblock4
#     gradcam = GradCAM(model, target_layer)
#     heatmap = gradcam(tensor, class_idx=None)  # HxW
#     # overlay
#     pil_img = pil_image_from_bytes(image_bytes).resize((tensor.shape[3], tensor.shape[2]))
#     overlay = overlay_heatmap_on_image(pil_img, heatmap, alpha=0.5)
#     heatmap_b64 = pil_to_base64(overlay)
#     gradcam.remove_hooks()
#     return pred_class, prob, heatmap_b64
# project/backend/image_predict.py
"""
Image prediction helper: load image model, predict probability and class, 
and return Grad-CAM heatmap (base64).
"""

import sys
import os

# Add project root to PYTHONPATH
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

import torch
import torch.nn.functional as F
from torchvision.models import densenet121, DenseNet121_Weights
import io
from PIL import Image
import numpy as np

from utils.preprocessing import image_bytes_to_tensor, pil_image_from_bytes
from utils.gradcam import GradCAM, overlay_heatmap_on_image, pil_to_base64

MODELS_DIR = os.path.join(os.path.dirname(__file__), '..', 'models')


def load_image_model(device=None):
    device = device or ('cuda' if torch.cuda.is_available() else 'cpu')

    # ---- NEW WARNING-FREE WAY ----
    weights = DenseNet121_Weights.DEFAULT
    model = densenet121(weights=weights)

    # Convert pretrained RGB weights → 1-channel
    import torch.nn as nn
    old_conv = model.features.conv0
    new_conv = nn.Conv2d(
        1,
        old_conv.out_channels,
        kernel_size=old_conv.kernel_size,
        stride=old_conv.stride,
        padding=old_conv.padding,
        bias=False
    )

    with torch.no_grad():
        new_conv.weight[:] = old_conv.weight.mean(dim=1, keepdim=True)

    model.features.conv0 = new_conv

    # classifier for 2 classes
    model.classifier = nn.Linear(model.classifier.in_features, 2)

    # load weights
    ckpt_path = os.path.join(MODELS_DIR, "image_model.pth")
    if not os.path.exists(ckpt_path):
        raise FileNotFoundError(
            f"Image model checkpoint not found at {ckpt_path}. Please train model first."
        )

    saved = torch.load(ckpt_path, map_location=device)
    model.load_state_dict(saved["model_state_dict"])

    model = model.to(device)
    model.eval()
    return model


def predict_image_bytes(model, image_bytes):
    """
    Returns:
        pred_class int (0/1),
        probability float,
        gradcam_base64 str
    """
    device = next(model.parameters()).device

    tensor = image_bytes_to_tensor(image_bytes, train=False)  # [1,1,H,W]
    tensor = tensor.to(device)

    with torch.no_grad():
        out = model(tensor)
        probs = torch.softmax(out, dim=1)[:, 1].cpu().numpy()
        pred_class = int(out.argmax(dim=1).item())
        prob = float(probs[0])

    # ---- Grad-CAM ----
    target_layer = model.features.denseblock4
    gradcam = GradCAM(model, target_layer)

    heatmap = gradcam(tensor, class_idx=None)
    pil_img = pil_image_from_bytes(image_bytes).resize(
        (tensor.shape[3], tensor.shape[2])
    )
    overlay = overlay_heatmap_on_image(pil_img, heatmap, alpha=0.5)
    gradcam.remove_hooks()

    heatmap_b64 = pil_to_base64(overlay)

    return pred_class, prob, heatmap_b64
