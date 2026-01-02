# project/backend/image_predict.py
"""
Image prediction helper: load EfficientNet ultrasound model, predict probability and class, 
and return Grad-CAM heatmap (base64).
"""

import sys
import os

# Add project root to PYTHONPATH
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

import torch
import torch.nn as nn
import torch.nn.functional as F
import torchvision.models as models
from torchvision import transforms
import io
from PIL import Image
import numpy as np
import cv2
import base64

MODELS_DIR = os.path.join(os.path.dirname(__file__), '..', 'models')

def load_image_model(device=None):
    """Load the NEW EfficientNet ultrasound model"""
    device = device or ('cuda' if torch.cuda.is_available() else 'cpu')

    # Use the new trained EfficientNet ultrasound model
    new_model_path = os.path.join(os.path.dirname(MODELS_DIR), "efficientnet_ultrasound.pth")
    
    if not os.path.exists(new_model_path):
        raise FileNotFoundError(
            f"EfficientNet ultrasound model not found at {new_model_path}. Please check the model path."
        )

    # Create EfficientNet-B0 model with binary classification
    model = models.efficientnet_b0(weights=None)
    model.classifier[1] = nn.Linear(1280, 2)  # Binary classification: benign vs malignant
    
    # Load the trained weights
    model.load_state_dict(torch.load(new_model_path, map_location=device))
    model = model.to(device)
    model.eval()
    
    print(f"✅ Loaded NEW EfficientNet ultrasound model from {new_model_path}")
    print("🎯 Model: EfficientNet-B0 for ultrasound binary classification")
    print("📊 Classes: 0=Benign, 1=Malignant")
    
    return model


def image_bytes_to_tensor_ultrasound(image_bytes, image_size=224):
    """Convert image bytes to tensor for ultrasound model"""
    # Open image and convert to RGB
    image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    
    # Same transforms as used in training (from gradcam.py)
    transform = transforms.Compose([
        transforms.Resize((image_size, image_size)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5])
    ])
    
    # Apply transforms and add batch dimension
    tensor = transform(image).unsqueeze(0)  # [1, 3, H, W]
    return tensor

def pil_image_from_bytes(image_bytes):
    """Convert image bytes to PIL Image"""
    return Image.open(io.BytesIO(image_bytes)).convert('RGB')

class EfficientNetGradCAM:
    """Grad-CAM implementation for EfficientNet"""
    
    def __init__(self, model):
        self.model = model
        self.gradients = []
        self.activations = []
        self.hooks = []
        
        # Register hooks on the last feature layer
        target_layer = model.features[-1]
        self.hooks.append(target_layer.register_forward_hook(self._forward_hook))
        self.hooks.append(target_layer.register_backward_hook(self._backward_hook))
    
    def _forward_hook(self, module, input, output):
        self.activations.append(output)
    
    def _backward_hook(self, module, grad_in, grad_out):
        self.gradients.append(grad_out[0])
    
    def generate_cam(self, input_tensor, class_idx=None):
        """Generate Grad-CAM heatmap"""
        # Clear previous gradients and activations
        self.gradients.clear()
        self.activations.clear()
        
        # Forward pass
        output = self.model(input_tensor)
        
        if class_idx is None:
            class_idx = output.argmax().item()
        
        # Backward pass
        self.model.zero_grad()
        output[0, class_idx].backward()
        
        # Generate CAM
        grad = self.gradients[0].mean(dim=(2, 3), keepdim=True)
        cam = (grad * self.activations[0]).sum(dim=1).squeeze()
        cam = F.relu(cam)
        
        # Normalize CAM
        cam = cam.detach().cpu().numpy()
        cam = cv2.resize(cam, (224, 224))
        cam = (cam - cam.min()) / (cam.max() - cam.min() + 1e-8)
        
        return cam
    
    def remove_hooks(self):
        """Remove all hooks"""
        for hook in self.hooks:
            hook.remove()
        self.hooks.clear()

def overlay_heatmap_on_image(pil_img, heatmap, alpha=0.4):
    """Overlay heatmap on original image"""
    # Convert PIL to numpy
    orig = cv2.resize(np.array(pil_img), (224, 224))
    
    # Create heatmap overlay
    heatmap_colored = cv2.applyColorMap(np.uint8(255 * heatmap), cv2.COLORMAP_JET)
    
    # Blend images
    overlay = cv2.addWeighted(orig, 1-alpha, heatmap_colored, alpha, 0)
    
    # Convert back to PIL
    return Image.fromarray(cv2.cvtColor(overlay, cv2.COLOR_BGR2RGB))

def pil_to_base64(pil_img):
    """Convert PIL image to base64 string"""
    buffer = io.BytesIO()
    pil_img.save(buffer, format='PNG')
    img_str = base64.b64encode(buffer.getvalue()).decode()
    return img_str

def predict_image_bytes(model, image_bytes):
    """
    Predict using NEW EfficientNet ultrasound model
    
    Returns:
        pred_class int (0/1),
        probability float,
        gradcam_base64 str
    """
    device = next(model.parameters()).device

    # Convert to tensor for ultrasound model
    tensor = image_bytes_to_tensor_ultrasound(image_bytes, image_size=224)
    tensor = tensor.to(device)

    with torch.no_grad():
        out = model(tensor)
        probs = torch.softmax(out, dim=1)
        pred_class = int(out.argmax(dim=1).item())
        
        # Get probability of the predicted class
        prob = float(probs[0, pred_class])

    # ---- Grad-CAM ----
    gradcam = EfficientNetGradCAM(model)
    heatmap = gradcam.generate_cam(tensor, class_idx=pred_class)
    
    # Overlay on original image
    pil_img = pil_image_from_bytes(image_bytes)
    overlay = overlay_heatmap_on_image(pil_img, heatmap, alpha=0.4)
    gradcam.remove_hooks()

    heatmap_b64 = pil_to_base64(overlay)

    return pred_class, prob, heatmap_b64
