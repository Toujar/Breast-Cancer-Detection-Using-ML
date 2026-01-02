import { NextResponse } from "next/server";
import { auth } from '@clerk/nextjs/server';
import connectDB from "@/lib/mongodb";
import AppointmentRequest from "@/models/AppointmentRequest";
import mongoose from 'mongoose';

export async function GET(req) {
  try {
    // Get authenticated user from Clerk
    const { userId } = await auth();
    
    if (!userId) {
      console.log('❌ No userId from Clerk auth');
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    console.log('✅ User authenticated:', userId);

    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Clear mongoose model cache and import models fresh
    if (mongoose.models.User) {
      delete mongoose.models.User;
    }
    if (mongoose.models.Doctor) {
      delete mongoose.models.Doctor;
    }
    
    // Import models dynamically to ensure fresh schema
    const { default: User } = await import("@/models/User");
    const { default: Doctor } = await import("@/models/Doctor");

    // Find the user in MongoDB by Clerk ID
    const user = await User.findOne({ clerkId: userId });
    
    if (!user) {
      console.log('❌ User not found in MongoDB for Clerk ID:', userId);
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    console.log('✅ Found user in MongoDB:', user._id);

    // Get appointment requests for this user using MongoDB ObjectId
    const requests = await AppointmentRequest.find({ patientId: user._id })
      .populate("doctorId", "firstName lastName specialization hospital location")
      .sort({ createdAt: -1 })
      .lean();

    console.log(`✅ Found ${requests.length} appointment requests for user`);

    return NextResponse.json({ 
      requests,
      total: requests.length,
      pending: requests.filter(r => r.status === 'pending').length,
      accepted: requests.filter(r => r.status === 'accepted').length,
      rejected: requests.filter(r => r.status === 'rejected').length,
      completed: requests.filter(r => r.status === 'completed').length
    });
  } catch (error) {
    console.error("❌ Error fetching user appointment requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointment requests", details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req) {
  try {
    // Get authenticated user from Clerk
    const { userId } = await auth();
    
    if (!userId) {
      console.log('❌ No userId from Clerk auth');
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    console.log('✅ User authenticated:', userId);

    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Clear mongoose model cache and import models fresh
    if (mongoose.models.User) {
      delete mongoose.models.User;
    }
    if (mongoose.models.Doctor) {
      delete mongoose.models.Doctor;
    }
    
    // Import models dynamically to ensure fresh schema
    const { default: User } = await import("@/models/User");
    const { default: Doctor } = await import("@/models/Doctor");

    // Find the user in MongoDB by Clerk ID
    const user = await User.findOne({ clerkId: userId });
    
    if (!user) {
      console.log('❌ User not found in MongoDB for Clerk ID:', userId);
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

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
      patientId: user._id, // Use MongoDB ObjectId
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
    console.error("❌ Error updating user appointment request:", error);
    return NextResponse.json(
      { error: "Failed to update appointment request", details: error.message },
      { status: 500 }
    );
  }
}