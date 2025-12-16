import mongoose from "mongoose";

const AppointmentRequestSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    patientName: {
      type: String,
      required: true,
      trim: true,
    },
    patientAge: {
      type: Number,
      required: true,
      min: 0,
      max: 120,
    },
    patientContact: {
      type: String,
      required: true,
      trim: true,
    },
    patientLocation: {
      type: String,
      required: true,
      trim: true,
    },
    consultationMode: {
      type: String,
      enum: ["online", "in-person"],
      required: true,
    },
    preferredDate: {
      type: String,
      trim: true,
    },
    symptoms: {
      type: String,
      trim: true,
    },
    aiResult: {
      riskLevel: {
        type: String,
        enum: ["Low", "Medium", "High"],
        required: true,
      },
      confidence: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },
      summary: {
        type: String,
        required: true,
        trim: true,
      },
      imageAnalysis: {
        type: String,
        trim: true,
      },
      predictionId: {
        type: String,
        trim: true,
      },
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed"],
      default: "pending",
    },
    urgency: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    doctorNotes: {
      type: String,
      trim: true,
    },
    appointmentDate: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
AppointmentRequestSchema.index({ doctorId: 1, status: 1 });
AppointmentRequestSchema.index({ patientId: 1, createdAt: -1 });

export default mongoose.models.AppointmentRequest || mongoose.model("AppointmentRequest", AppointmentRequestSchema);