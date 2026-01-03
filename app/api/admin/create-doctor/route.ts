export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '../../_utils/auth-utils';
import { createClerkClient } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import Doctor from '@/models/Doctor';
import { z } from 'zod';

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

const createDoctorSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  specialization: z.string().min(1, 'Specialization is required'),
  qualification: z.string().min(1, 'Qualification is required'),
  experience: z.string().transform((val) => parseInt(val, 10)).refine((val) => val >= 0, 'Experience must be a positive number'),
  licenseNumber: z.string().min(1, 'License number is required'),
  hospital: z.string().min(1, 'Hospital name is required'),
  location: z.string().min(1, 'Location is required'),
  phoneNumber: z.string().optional(),
  rating: z.string().optional().default('4.5')
});

export async function POST(req: NextRequest) {
  try {
    // Ensure only admins can create doctor accounts
    await requireAdmin();

    const body = await req.json();
    const validatedData = createDoctorSchema.parse(body);

    // Connect to database
    await connectDB();

    // Check if doctor already exists in MongoDB
    const existingDoctor = await Doctor.findOne({ email: validatedData.email });
    if (existingDoctor) {
      return NextResponse.json(
        { error: 'A doctor with this email already exists' },
        { status: 400 }
      );
    }

    // Create doctor account using Clerk's server API
    const clerkDoctor = await clerkClient.users.createUser({
      emailAddress: [validatedData.email],
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      password: validatedData.password,
      publicMetadata: {
        role: 'doctor',
        specialization: validatedData.specialization,
        hospital: validatedData.hospital,
        location: validatedData.location,
        experience: validatedData.experience,
        qualification: validatedData.qualification,
        licenseNumber: validatedData.licenseNumber,
        phoneNumber: validatedData.phoneNumber,
        rating: parseFloat(validatedData.rating || '4.5')
      },
      skipPasswordChecks: false,
      skipPasswordRequirement: false,
    });

    // Save doctor information to MongoDB
    const mongoDoctor = new Doctor({
      clerkId: clerkDoctor.id,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      email: validatedData.email,
      phoneNumber: validatedData.phoneNumber || '',
      specialization: validatedData.specialization,
      qualification: validatedData.qualification,
      experience: validatedData.experience,
      licenseNumber: validatedData.licenseNumber,
      hospital: validatedData.hospital,
      location: validatedData.location,
      rating: parseFloat(validatedData.rating || '4.5'),
      isVerified: true,
      isActive: true,
      consultationFee: 500, // Default consultation fee
      languages: ['English', 'Hindi'], // Default languages
      availableSlots: [
        { day: 'Monday', startTime: '09:00', endTime: '17:00' },
        { day: 'Tuesday', startTime: '09:00', endTime: '17:00' },
        { day: 'Wednesday', startTime: '09:00', endTime: '17:00' },
        { day: 'Thursday', startTime: '09:00', endTime: '17:00' },
        { day: 'Friday', startTime: '09:00', endTime: '17:00' },
        { day: 'Saturday', startTime: '09:00', endTime: '13:00' }
      ]
    });

    await mongoDoctor.save();

    return NextResponse.json({
      success: true,
      doctor: {
        id: clerkDoctor.id,
        mongoId: mongoDoctor._id,
        email: clerkDoctor.emailAddresses[0]?.emailAddress,
        firstName: clerkDoctor.firstName,
        lastName: clerkDoctor.lastName,
        role: 'doctor',
        specialization: validatedData.specialization,
        hospital: validatedData.hospital,
        location: validatedData.location,
        experience: validatedData.experience,
        qualification: validatedData.qualification,
        licenseNumber: validatedData.licenseNumber,
        phoneNumber: validatedData.phoneNumber,
        rating: parseFloat(validatedData.rating || '4.5')
      },
    });
  } catch (error) {
    console.error('Error creating doctor account:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      // Handle Clerk API errors
      if (error.message.includes('email_address_taken')) {
        return NextResponse.json(
          { error: 'Email address is already taken' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to create doctor account' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Ensure only admins can list doctors
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Connect to database
    await connectDB();

    // Get all doctors from MongoDB with pagination
    const doctors = await Doctor.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .lean();

    const totalCount = await Doctor.countDocuments({ isActive: true });

    return NextResponse.json({
      doctors: doctors.map((doctor) => ({
        id: doctor.clerkId,
        mongoId: doctor._id,
        email: doctor.email,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        role: 'doctor',
        specialization: doctor.specialization,
        qualification: doctor.qualification,
        experience: doctor.experience,
        licenseNumber: doctor.licenseNumber,
        hospital: doctor.hospital,
        location: doctor.location,
        phoneNumber: doctor.phoneNumber,
        rating: doctor.rating,
        isVerified: doctor.isVerified,
        consultationFee: doctor.consultationFee,
        totalPatients: doctor.totalPatients,
        totalConsultations: doctor.totalConsultations,
        createdAt: doctor.createdAt,
        updatedAt: doctor.updatedAt
      })),
      totalCount,
      hasMore: offset + limit < totalCount
    });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch doctors' },
      { status: 500 }
    );
  }
}