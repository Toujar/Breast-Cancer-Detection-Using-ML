import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import AppointmentRequest from "@/models/AppointmentRequest";

export async function GET(req) {
  try {
    await connectDB();

    // Get doctor from token
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "doctor") {
      return NextResponse.json({ error: "Doctor access required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    // Build query
    const query = { doctorId: decoded.id };
    if (status && status !== "all") {
      query.status = status;
    }

    // Get appointment requests
    const requests = await AppointmentRequest.find(query)
      .populate("patientId", "username email")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ requests });
  } catch (error) {
    console.error("Error fetching appointment requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointment requests" },
      { status: 500 }
    );
  }
}

export async function PATCH(req) {
  try {
    await connectDB();

    // Get doctor from token
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "doctor") {
      return NextResponse.json({ error: "Doctor access required" }, { status: 403 });
    }

    const { requestId, action, doctorNotes, appointmentDate, rejectionReason } = await req.json();

    if (!requestId || !action) {
      return NextResponse.json(
        { error: "Request ID and action are required" },
        { status: 400 }
      );
    }

    // Find the appointment request
    const request = await AppointmentRequest.findOne({
      _id: requestId,
      doctorId: decoded.id,
    });

    if (!request) {
      return NextResponse.json(
        { error: "Appointment request not found" },
        { status: 404 }
      );
    }

    // Update based on action
    const updateData = { status: action };
    
    if (action === "accepted") {
      updateData.doctorNotes = doctorNotes;
      if (appointmentDate) {
        updateData.appointmentDate = new Date(appointmentDate);
      }
    } else if (action === "rejected") {
      updateData.rejectionReason = rejectionReason;
    }

    const updatedRequest = await AppointmentRequest.findByIdAndUpdate(
      requestId,
      updateData,
      { new: true }
    );

    return NextResponse.json({
      message: `Appointment request ${action} successfully`,
      request: updatedRequest,
    });
  } catch (error) {
    console.error("Error updating appointment request:", error);
    return NextResponse.json(
      { error: "Failed to update appointment request" },
      { status: 500 }
    );
  }
}