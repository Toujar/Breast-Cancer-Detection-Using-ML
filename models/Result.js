import mongoose from "mongoose";

const ResultSchema = new mongoose.Schema(
  {
    predictionId: { type: String, required: true, index: true, unique: true },
    userId: { type: String, required: true, index: true },
    user: {
      id: { type: String, index: true },
      email: { type: String },
      username: { type: String },
      role: { type: String },
    },
    type: { type: String, enum: ["tabular", "image", "multimodal"], required: true },
    prediction: { type: String, enum: ["benign", "malignant"], required: true },
    confidence: { type: Number, required: true },
    inputData: { type: mongoose.Schema.Types.Mixed },
    modelMetrics: {
      accuracy: { type: Number },
      precision: { type: Number },
      recall: { type: Number },
      f1Score: { type: Number },
      version: { type: String },
      algorithm: { type: String },
    },
    // Grad-CAM visualization for image predictions (base64 encoded)
    gradcam: { type: String },
    // SHAP visualization for tabular predictions (base64 encoded)
    shap: { type: String },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

export default mongoose.models.Result || mongoose.model("Result", ResultSchema);


