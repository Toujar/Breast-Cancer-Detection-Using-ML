# project/utils/gradcam.py
"""
Simple Grad-CAM implementation for PyTorch models.
Assumes model has a single convolutional feature extractor (we will hook DenseNet121's last features).
"""

import torch
import torch.nn.functional as F
from torchvision import transforms
import numpy as np
from PIL import Image
import io
import base64

class GradCAM:
    def __init__(self, model, target_layer):
        """
        model: torch.nn.Module (eval mode recommended)
        target_layer: torch.nn.Module (the convolutional layer to hook)
        """
        self.model = model
        self.target_layer = target_layer
        self.gradients = None
        self.activations = None
        self.hooks = []
        self._register_hooks()

    def _register_hooks(self):
        def forward_hook(module, inp, out):
            self.activations = out.detach()

        def backward_hook(module, grad_in, grad_out):
            # grad_out is a tuple; take first element
            self.gradients = grad_out[0].detach()

        self.hooks.append(self.target_layer.register_forward_hook(forward_hook))
        self.hooks.append(self.target_layer.register_backward_hook(backward_hook))

    def remove_hooks(self):
        for h in self.hooks:
            h.remove()
        self.hooks = []

    def __call__(self, input_tensor: torch.Tensor, class_idx: int = None):
        """
        input_tensor: shape [B, C, H, W], requires_grad=False
        class_idx: target class index; if None, uses top predicted class
        Returns:
            heatmap (numpy array HxW, normalized 0-1)
        """
        self.model.eval()
        input_tensor = input_tensor.to(next(self.model.parameters()).device)

        # forward
        output = self.model(input_tensor)  # expect shape [B, num_classes]
        if class_idx is None:
            class_idx = output.argmax(dim=1).item()

        # zero grads
        self.model.zero_grad()
        # create scalar for desired class (for batch first element)
        one_hot = torch.zeros_like(output)
        one_hot[0, class_idx] = 1.0
        output.backward(gradient=one_hot, retain_graph=True)

        # compute weights: global average pooling of gradients
        grads = self.gradients[0]  # [C, H, W]
        acts = self.activations[0]  # [C, H, W]
        alpha = grads.mean(dim=(1,2))  # [C]

        # weighted combination
        cam = (alpha[:, None, None] * acts).sum(dim=0).cpu().numpy()
        # relu
        cam = np.maximum(cam, 0)
        # normalize to 0-1
        if cam.max() != 0:
            cam = cam / (cam.max() + 1e-8)
        # resize to input spatial size
        cam_resized = transforms.functional.resize(Image.fromarray(np.uint8(cam*255)), (input_tensor.shape[2], input_tensor.shape[3]))
        cam_resized = np.array(cam_resized).astype(np.float32)/255.0
        return cam_resized

def overlay_heatmap_on_image(img_pil: Image.Image, heatmap: np.ndarray, alpha: float = 0.5):
    """
    img_pil: original PIL image (RGB or L)
    heatmap: HxW normalized 0-1
    returns: PIL image with heatmap overlay
    """
    import matplotlib.cm as cm
    # ensure rgb
    if img_pil.mode == 'L':
        img_rgb = img_pil.convert('RGB')
    else:
        img_rgb = img_pil

    cmap = cm.get_cmap('jet')
    heatmap_colored = cmap(heatmap)[:, :, :3]  # HxWx3
    heatmap_img = Image.fromarray((heatmap_colored * 255).astype(np.uint8)).resize(img_rgb.size)
    blended = Image.blend(img_rgb, heatmap_img, alpha=alpha)
    return blended

def pil_to_base64(img_pil: Image.Image, fmt='PNG'):
    buffered = io.BytesIO()
    img_pil.save(buffered, format=fmt)
    b64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
    return b64
