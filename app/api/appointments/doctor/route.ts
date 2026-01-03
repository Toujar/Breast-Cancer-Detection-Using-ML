export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { requireUser } from '../../_utils/auth-utils';
import connectDB from '@/lib/mongodb';
import AppointmentRequest from '@/models/AppointmentRequest.js';
import Doctor from '@/models/Doctor';

export async function GET() {
  try {
    // Verify user is authenticated and is a doctor
    const user = await requireUser();
    const userRole = user.role;

    if (userRole !== 'doctor') {
      return NextResponse.json(
        { error: 'Access denied. Doctor role required.' },
        { status: 403 }
      );
    }

    // Connect to database
    await connectDB();

    // Find the doctor record in MongoDB to get the doctor's ObjectId
    const doctor = await Doctor.findOne({ clerkId: user.id });
    
    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor profile not found. Please contact admin.' },
        { status: 404 }
      );
    }

    // Fetch appointment requests for this doctor from the database
    const appointmentRequests = await AppointmentRequest.find({ doctorId: doctor._id })
      .populate('patientId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .lean();

    // Transform the data to match the expected format
    const transformedRequests = appointmentRequests.map((req: any) => ({
      _id: req._id.toString(),
      patientName: req.patientName,
      patientAge: req.patientAge,
      patientContact: req.patientContact,
      patientLocation: req.patientLocation,
      createdAt: req.createdAt.toISOString(),
      consultationMode: req.consultationMode,
      status: req.status,
      aiResult: req.aiResult ? {
        riskLevel: req.aiResult.riskLevel,
        confidence: req.aiResult.confidence,
        summary: req.aiResult.summary,
        imageAnalysis: req.aiResult.imageAnalysis || 'No image analysis available'
      } : {
        riskLevel: 'Unknown',
        confidence: 0,
        summary: 'No AI analysis available',
        imageAnalysis: 'No image analysis available'
      },
      urgency: req.urgency,
      preferredDate: req.preferredDate,
      symptoms: req.symptoms,
      doctorNotes: req.doctorNotes,
      appointmentDate: req.appointmentDate,
      rejectionReason: req.rejectionReason,
      patientId: req.patientId ? {
        username: `${req.patientId.firstName || 'Unknown'} ${req.patientId.lastName || 'User'}`,
        email: req.patientId.email || 'No email'
      } : null
    }));
    
    return NextResponse.json({
      success: true,
      requests: transformedRequests,
      total: transformedRequests.length,
      doctorInfo: {
        id: doctor._id.toString(),
        name: `Dr. ${doctor.firstName} ${doctor.lastName}`,
        specialization: doctor.specialization
      }
    });

  } catch (error: any) {
    console.error('Error fetching appointment requests:', error);
    
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch appointment requests' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    // Verify user is authenticated and is a doctor
    const user = await requireUser();
    const userRole = user.role;

    if (userRole !== 'doctor') {
      return NextResponse.json(
        { error: 'Access denied. Doctor role required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { requestId, action, doctorNotes, rejectionReason } = body;

    if (!requestId || !action) {
      return NextResponse.json(
        { error: 'Request ID and action are required' },
        { status: 400 }
      );
    }

    if (!['accepted', 'rejected', 'completed'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be accepted, rejected, or completed' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Find the doctor record
    const doctor = await Doctor.findOne({ clerkId: user.id });
    
    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor profile not found' },
        { status: 404 }
      );
    }

    // Update the appointment request in the database
    const updateData: any = {
      status: action,
      updatedAt: new Date()
    };

    if (doctorNotes) {
      updateData.doctorNotes = doctorNotes;
    }

    if (rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    // If accepted, you might want to set an appointment date
    if (action === 'accepted') {
      // You could add logic here to set an appointment date based on doctor's availability
      updateData.appointmentDate = new Date(); // Placeholder - implement proper scheduling logic
    }

    const updatedRequest = await AppointmentRequest.findOneAndUpdate(
      { _id: requestId, doctorId: doctor._id }, // Ensure the request belongs to this doctor
      updateData,
      { new: true }
    );

    if (!updatedRequest) {
      return NextResponse.json(
        { error: 'Appointment request not found or access denied' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: `Appointment request ${action} successfully`,
      requestId,
      action,
      doctorId: user.id,
      doctorNotes,
      rejectionReason,
      updatedAt: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error updating appointment request:', error);
    
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update appointment request' },
      { status: 500 }
    );
  }
}