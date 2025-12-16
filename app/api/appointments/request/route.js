import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import AppointmentRequest from "@/models/AppointmentRequest";
import User from "@/models/User";

export async function POST(req) {
  try {
    await connectDB();

    // Get user from token
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const {
      doctorId,
      patientName,
      patientAge,
      patientContact,
      consultationMode,
      preferredDate,
      symptoms,
      aiResult,
    } = await req.json();

    // Validate required fields
    if (!doctorId || !patientName || !patientAge || !patientContact || !consultationMode || !aiResult) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get patient and doctor details
    const patient = await User.findById(userId);
    const doctor = await User.findById(doctorId);

    if (!patient || !doctor || doctor.role !== "doctor") {
      return NextResponse.json(
        { error: "Invalid patient or doctor" },
        { status: 400 }
      );
    }

    // Determine urgency based on AI result
    let urgency = "low";
    if (aiResult.riskLevel === "High" || aiResult.confidence > 90) {
      urgency = "high";
    } else if (aiResult.riskLevel === "Medium" || aiResult.confidence > 70) {
      urgency = "medium";
    }

    // Create appointment request
    const appointmentRequest = await AppointmentRequest.create({
      patientId: userId,
      doctorId,
      patientName,
      patientAge,
      patientContact,
      patientLocation: patient.location,
      consultationMode,
      preferredDate,
      symptoms,
      aiResult,
      urgency,
    });

    return NextResponse.json(
      {
        message: "Appointment request sent successfully",
        requestId: appointmentRequest._id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Appointment request error:", error);
    return NextResponse.json(
      { error: "Failed to send appointment request" },
      { status: 500 }
    );
  }
}