import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import AppointmentRequest from "@/models/AppointmentRequest";

export async function GET(req) {
  try {
    await connectDB();

    // Get user from token
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Get appointment requests for this user
    const requests = await AppointmentRequest.find({ patientId: userId })
      .populate("doctorId", "username specialization hospital location")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ 
      requests,
      total: requests.length,
      pending: requests.filter(r => r.status === 'pending').length,
      accepted: requests.filter(r => r.status === 'accepted').length,
      rejected: requests.filter(r => r.status === 'rejected').length,
      completed: requests.filter(r => r.status === 'completed').length
    });
  } catch (error) {
    console.error("Error fetching user appointment requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointment requests" },
      { status: 500 }
    );
  }
}

export async function PATCH(req) {
  try {
    await connectDB();

    // Get user from token
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const { requestId, action } = await req.json();

    if (!requestId || !action) {
      return NextResponse.json(
        { error: "Request ID and action are required" },
        { status: 400 }
      );
    }

    // Find the appointment request (ensure it belongs to this user)
    const request = await AppointmentRequest.findOne({
      _id: requestId,
      patientId: userId,
    });

    if (!request) {
      return NextResponse.json(
        { error: "Appointment request not found" },
        { status: 404 }
      );
    }

    // Only allow certain actions from user side
    if (action === 'cancel' && request.status === 'pending') {
      request.status = 'cancelled';
      await request.save();
      
      return NextResponse.json({
        message: "Appointment request cancelled successfully",
        request,
      });
    } else if (action === 'mark_completed' && request.status === 'accepted') {
      request.status = 'completed';
      await request.save();
      
      return NextResponse.json({
        message: "Appointment marked as completed",
        request,
      });
    } else {
      return NextResponse.json(
        { error: "Invalid action for current request status" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error updating user appointment request:", error);
    return NextResponse.json(
      { error: "Failed to update appointment request" },
      { status: 500 }
    );
  }
}