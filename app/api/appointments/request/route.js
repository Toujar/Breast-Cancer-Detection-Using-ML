export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from "next/server";
import { auth } from '@clerk/nextjs/server';
import { createClerkClient } from '@clerk/nextjs/server';
import connectDB from "@/lib/mongodb";
import AppointmentRequest from "@/models/AppointmentRequest";
import Doctor from "@/models/Doctor";
import mongoose from 'mongoose';

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export async function POST(req) {
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
    
    // Clear mongoose model cache and import User model fresh
    if (mongoose.models.User) {
      delete mongoose.models.User;
    }
    
    // Import User model dynamically to ensure fresh schema
    const { default: User } = await import("@/models/User");
    
    // Debug: Check User model schema
    console.log('🔍 User model schema paths:', Object.keys(User.schema.paths));
    console.log('🔍 Required User fields:', Object.keys(User.schema.paths).filter(path => User.schema.paths[path].isRequired));

    const body = await req.json();
    console.log('📦 Request body:', JSON.stringify(body, null, 2));

    const {
      doctorId,
      patientName,
      patientAge,
      patientContact,
      consultationMode,
      preferredDate,
      symptoms,
      aiResult,
    } = body;

    // Validate required fields
    if (!doctorId || !patientName || !patientAge || !patientContact || !consultationMode || !aiResult) {
      console.log('❌ Missing required fields:', {
        doctorId: !!doctorId,
        patientName: !!patientName,
        patientAge: !!patientAge,
        patientContact: !!patientContact,
        consultationMode: !!consultationMode,
        aiResult: !!aiResult
      });
      return NextResponse.json(
        { 
          error: "Missing required fields",
          details: {
            doctorId: !!doctorId,
            patientName: !!patientName,
            patientAge: !!patientAge,
            patientContact: !!patientContact,
            consultationMode: !!consultationMode,
            aiResult: !!aiResult
          }
        },
        { status: 400 }
      );
    }

    // Validate aiResult structure
    if (!aiResult.riskLevel || !aiResult.confidence || !aiResult.summary) {
      console.log('❌ Invalid aiResult structure:', {
        riskLevel: !!aiResult.riskLevel,
        confidence: !!aiResult.confidence,
        summary: !!aiResult.summary,
        aiResult
      });
      return NextResponse.json(
        { 
          error: "Invalid AI result data",
          details: {
            riskLevel: !!aiResult.riskLevel,
            confidence: !!aiResult.confidence,
            summary: !!aiResult.summary
          }
        },
        { status: 400 }
      );
    }

    // Validate aiResult values
    if (!['Low', 'Medium', 'High'].includes(aiResult.riskLevel)) {
      console.log('❌ Invalid riskLevel:', aiResult.riskLevel);
      return NextResponse.json(
        { error: "Invalid risk level. Must be Low, Medium, or High" },
        { status: 400 }
      );
    }

    if (typeof aiResult.confidence !== 'number' || aiResult.confidence < 0 || aiResult.confidence > 100) {
      console.log('❌ Invalid confidence:', aiResult.confidence);
      return NextResponse.json(
        { error: "Invalid confidence. Must be a number between 0 and 100" },
        { status: 400 }
      );
    }

    // Get patient from MongoDB (by Clerk ID)
    console.log('🔍 Looking for patient with Clerk ID:', userId);
    let patient = await User.findOne({ clerkId: userId });
    
    if (!patient) {
      console.log('❌ Patient profile not found in MongoDB for Clerk ID:', userId);
      console.log('💡 Creating patient record from Clerk data');
      
      try {
        const clerkUser = await clerkClient.users.getUser(userId);
        console.log('✅ Got Clerk user data:', clerkUser.emailAddresses[0]?.emailAddress);
        
        // Create a new user record in MongoDB
        patient = await User.create({
          clerkId: userId,
          firstName: clerkUser.firstName || 'Unknown',
          lastName: clerkUser.lastName || 'User',
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          phoneNumber: clerkUser.phoneNumbers[0]?.phoneNumber || '',
          role: 'user',
          profileImage: clerkUser.imageUrl || null,
          isVerified: clerkUser.emailAddresses[0]?.verification?.status === 'verified' || false,
          preferences: {
            notifications: {
              email: true,
              sms: false,
              push: true
            },
            language: 'en',
            timezone: 'Asia/Kolkata'
          },
          subscription: {
            plan: 'free',
            isActive: true
          },
          stats: {
            totalPredictions: 0,
            totalConsultations: 0
          }
        });
        
        console.log('✅ Created new patient record:', patient._id);
        
      } catch (clerkError) {
        console.error('❌ Could not fetch Clerk user or create patient record:', clerkError);
        console.error('❌ Clerk error details:', {
          message: clerkError.message,
          stack: clerkError.stack,
          name: clerkError.name
        });
        return NextResponse.json(
          { 
            error: "Could not create patient profile. Please try again.",
            details: clerkError.message 
          },
          { status: 500 }
        );
      }
    } else {
      console.log('✅ Found patient in MongoDB:', patient._id);
    }

    // Get doctor from MongoDB
    console.log('🔍 Looking for doctor with ID:', doctorId);
    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      console.log('❌ Doctor not found with ID:', doctorId);
      return NextResponse.json(
        { error: "Doctor not found" },
        { status: 400 }
      );
    }

    if (!doctor.isActive || !doctor.isVerified) {
      console.log('❌ Doctor is inactive or not verified');
      return NextResponse.json(
        { error: "Invalid or inactive doctor" },
        { status: 400 }
      );
    }

    console.log('✅ Found doctor:', `Dr. ${doctor.firstName} ${doctor.lastName}`);

    // Determine urgency based on AI result
    let urgency = "low";
    if (aiResult.riskLevel === "High" || aiResult.confidence > 90) {
      urgency = "high";
    } else if (aiResult.riskLevel === "Medium" || aiResult.confidence > 70) {
      urgency = "medium";
    }

    // Get patient location
    let patientLocation = patient.address?.city || 'Location not provided';
    
    try {
      const clerkUser = await clerkClient.users.getUser(userId);
      patientLocation = clerkUser.publicMetadata?.location || patientLocation;
    } catch (error) {
      console.log('⚠️ Could not fetch additional user data from Clerk');
    }

    // Ensure patientLocation is never empty
    if (!patientLocation || patientLocation.trim() === '') {
      patientLocation = 'Location not provided';
    }

    // Create appointment request
    console.log('📝 Creating appointment request...');
    const appointmentRequest = await AppointmentRequest.create({
      patientId: patient._id, // Use MongoDB ObjectId (now always exists)
      patientClerkId: userId, // Always store Clerk ID
      doctorId: doctor._id,   // Use MongoDB ObjectId
      patientName,
      patientAge,
      patientContact,
      patientLocation,
      consultationMode,
      preferredDate,
      symptoms,
      aiResult,
      urgency,
    });

    console.log('✅ Appointment request created:', appointmentRequest._id);

    // Populate the created request to return complete data
    const populatedRequest = await AppointmentRequest.findById(appointmentRequest._id)
      .populate('patientId', 'firstName lastName email')
      .populate('doctorId', 'firstName lastName specialization');

    console.log('✅ Appointment request populated and ready to return');

    return NextResponse.json(
      {
        success: true,
        message: "Appointment request sent successfully",
        requestId: appointmentRequest._id,
        request: {
          id: populatedRequest._id,
          patientName: populatedRequest.patientName,
          doctorName: `Dr. ${populatedRequest.doctorId.firstName} ${populatedRequest.doctorId.lastName}`,
          doctorSpecialization: populatedRequest.doctorId.specialization,
          consultationMode: populatedRequest.consultationMode,
          status: populatedRequest.status,
          urgency: populatedRequest.urgency,
          createdAt: populatedRequest.createdAt
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Appointment request error:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      { 
        error: "Failed to send appointment request",
        details: error.message 
      },
      { status: 500 }
    );
  }
}