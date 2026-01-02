import torch
import torch.nn.functional as F
import torchvision.models as models
import torchvision.transforms as transforms
import cv2
import numpy as np
from PIL import Image

# ========== CONFIG ==========
IMAGE_PATH = r"D:\IMFFFFFFFFFFFFFFF\test.jpeg"   # any test image
MODEL_PATH = r"models\efficientnet_ultrasound.pth"
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
# ============================

# ---------- Load model ----------
model = models.efficientnet_b0(weights=None)
model.classifier[1] = torch.nn.Linear(1280, 2)
model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
model.to(DEVICE)
model.eval()

# ---------- Hook ----------
gradients = []
activations = []

def backward_hook(module, grad_in, grad_out):
    gradients.append(grad_out[0])

def forward_hook(module, input, output):
    activations.append(output)

target_layer = model.features[-1]
target_layer.register_forward_hook(forward_hook)
target_layer.register_backward_hook(backward_hook)

# ---------- Image ----------
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    # transforms.Normalize(mean=[0.5], std=[0.5])
    transforms.Normalize(
    mean=[0.5, 0.5, 0.5],
    std=[0.5, 0.5, 0.5]
    )
])

img = Image.open(IMAGE_PATH).convert("RGB")
input_tensor = transform(img).unsqueeze(0).to(DEVICE)

# ---------- Forward ----------
output = model(input_tensor)
class_idx = output.argmax().item()

# ---------- Backward ----------
model.zero_grad()
output[0, class_idx].backward()

# ---------- Grad‑CAM ----------
grad = gradients[0].mean(dim=(2, 3), keepdim=True)
cam = (grad * activations[0]).sum(dim=1).squeeze()
cam = F.relu(cam)

cam = cam.detach().cpu().numpy()
cam = cv2.resize(cam, (224, 224))
cam = (cam - cam.min()) / (cam.max() + 1e-8)

# ---------- Overlay ----------
orig = cv2.resize(np.array(img), (224, 224))
heatmap = cv2.applyColorMap(np.uint8(255 * cam), cv2.COLORMAP_JET)
overlay = cv2.addWeighted(orig, 0.6, heatmap, 0.4, 0)

cv2.imwrite("gradcam_output.png", overlay)
print("✅ Grad‑CAM saved as gradcam_output.png")
