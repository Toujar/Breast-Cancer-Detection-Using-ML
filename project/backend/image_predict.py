# project/backend/image_predict.py
"""
MEMORY-OPTIMIZED image prediction:
- CPU-only operations
- Explicit memory management
- Load/unload models on-demand
- Separate Grad-CAM processing
"""

import sys
import os
import gc
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

# Add project root to PYTHONPATH
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

MODELS_DIR = os.path.join(os.path.dirname(__file__), '..', 'models')

def load_image_model_cpu():
    """
    Load EfficientNet model with STRICT CPU-only operation
    Optimized for minimal memory usage
    """
    # FORCE CPU device - no GPU checks
    device = torch.device("cpu")
    
    model_path = os.path.join(os.path.dirname(MODELS_DIR), "efficientnet_ultrasound.pth")
    
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model not found: {model_path}")
    
    # Create model with minimal memory footprint
    model = models.efficientnet_b0(weights=None)
    model.classifier[1] = nn.Linear(1280, 2)
    
    # Load with explicit CPU mapping and no gradients
    with torch.no_grad():
        state_dict = torch.load(model_path, map_location=device)
        model.load_state_dict(state_dict)
        model = model.to(device)
        model.eval()
    
    print(f"✅ Image model loaded (CPU-only, {device})")
    return model

def image_bytes_to_tensor_cpu(image_bytes, image_size=224):
    """Convert image bytes to CPU tensor with memory optimization"""
    # Open and convert image
    image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    
    # Minimal transforms for memory efficiency
    transform = transforms.Compose([
        transforms.Resize((image_size, image_size)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5])
    ])
    
    # Apply transforms and add batch dimension
    with torch.no_grad():
        tensor = transform(image).unsqueeze(0)  # [1, 3, H, W]
    
    return tensor

def predict_image_bytes_memory_safe(model, image_bytes, gradcam=False):
    """
    Memory-safe prediction with optional Grad-CAM
    
    Args:
        model: Loaded EfficientNet model
        image_bytes: Raw image bytes
        gradcam: Whether to generate Grad-CAM (memory intensive)
    
    Returns:
        If gradcam=False: (pred_class, probability)
        If gradcam=True: (pred_class, probability, gradcam_b64)
    """
    device = torch.device("cpu")
    
    # Convert to tensor
    tensor = image_bytes_to_tensor_cpu(image_bytes, image_size=224)
    tensor = tensor.to(device)
    
    # Prediction with no gradients for memory efficiency
    with torch.no_grad():
        output = model(tensor)
        probs = torch.softmax(output, dim=1)
        pred_class = int(output.argmax(dim=1).item())
        prob = float(probs[0, pred_class])
    
    # Clean up prediction tensors
    del output, probs, tensor
    gc.collect()
    
    if not gradcam:
        return pred_class, prob
    
    # Grad-CAM generation (separate memory cycle)
    print("🔄 Generating Grad-CAM...")
    gradcam_b64 = generate_gradcam_memory_safe(model, image_bytes, pred_class)
    
    return pred_class, prob, gradcam_b64

def generate_gradcam_memory_safe(model, image_bytes, class_idx):
    """
    Memory-safe Grad-CAM generation with aggressive cleanup
    """
    device = torch.device("cpu")
    
    # Reload tensor for Grad-CAM (requires gradients)
    tensor = image_bytes_to_tensor_cpu(image_bytes, image_size=224)
    tensor = tensor.to(device)
    tensor.requires_grad_(True)
    
    # Hook for feature extraction
    activations = []
    gradients = []
    
    def forward_hook(module, input, output):
        activations.append(output)
    
    def backward_hook(module, grad_in, grad_out):
        gradients.append(grad_out[0])
    
    # Register hooks on last feature layer
    target_layer = model.features[-1]
    h1 = target_layer.register_forward_hook(forward_hook)
    h2 = target_layer.register_backward_hook(backward_hook)
    
    try:
        # Forward pass
        output = model(tensor)
        
        # Backward pass for gradients
        model.zero_grad()
        output[0, class_idx].backward()
        
        # Generate CAM
        grad = gradients[0].mean(dim=(2, 3), keepdim=True)
        cam = (grad * activations[0]).sum(dim=1).squeeze()
        cam = F.relu(cam)
        
        # Normalize CAM
        cam = cam.detach().cpu().numpy()
        cam = cv2.resize(cam, (224, 224))
        cam = (cam - cam.min()) / (cam.max() - cam.min() + 1e-8)
        
        # Create overlay
        pil_img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        overlay = overlay_heatmap_on_image(pil_img, cam, alpha=0.4)
        gradcam_b64 = pil_to_base64(overlay)
        
        # Cleanup
        del output, grad, cam, activations, gradients, tensor, pil_img, overlay
        gc.collect()
        
        return gradcam_b64
        
    finally:
        # Remove hooks
        h1.remove()
        h2.remove()
        gc.collect()

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
    buffer.close()
    return img_str
