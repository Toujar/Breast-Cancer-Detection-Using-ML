import { NextResponse } from 'next/server';
import { createClerkClient } from '@clerk/nextjs/server';
import { requireAdmin } from '../../_utils/auth-utils';
import connectDB from '@/lib/mongodb';
import Doctor from '@/models/Doctor';

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});
type DoctorLean = {
  _id: unknown;
  clerkId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  createdAt: Date;
  specialization?: string;
  qualification?: string;
  experience?: number;
  hospital?: string;
  location?: string;
  licenseNumber?: string;
  phoneNumber?: string;
  rating?: number;
  consultationFee?: number;
  totalPatients?: number;
  totalConsultations?: number;
  isVerified?: boolean;
  isActive?: boolean;
};

export async function GET() {
  try {
    // Verify admin access
    await requireAdmin();

    // Connect to database
    await connectDB();

    // Fetch all doctors from MongoDB
    // const doctors = await Doctor.find({ isActive: true })
    //   .sort({ createdAt: -1 })
    //   .lean();
    const doctors = (await Doctor.find({ isActive: true })
  .sort({ createdAt: -1 })
  .lean()) as unknown as DoctorLean[];


    // Also get Clerk data for last sign in information
    const clerkDoctors = await Promise.all(
      doctors.map(async (doctor) => {
        try {
          const clerkUser = await clerkClient.users.getUser(doctor.clerkId);
          return {
            ...doctor,
            lastSignInAt: clerkUser.lastSignInAt
          };
        } catch (error) {
          console.error(`Error fetching Clerk data for doctor ${doctor.clerkId}:`, error);
          return {
            ...doctor,
            lastSignInAt: null
          };
        }
      })
    );

    // Transform data for frontend
    const transformedDoctors = clerkDoctors.map(doctor => ({
      id: doctor.clerkId,
      mongoId: doctor._id,
      firstName: doctor.firstName || 'N/A',
      lastName: doctor.lastName || 'N/A',
      emailAddress: doctor.email || 'N/A',
      createdAt: doctor.createdAt,
      lastSignInAt: doctor.lastSignInAt,
      role: 'doctor',
      status: doctor.lastSignInAt ? 'active' : 'inactive',
      specialization: doctor.specialization,
      qualification: doctor.qualification,
      experience: doctor.experience,
      hospital: doctor.hospital,
      location: doctor.location,
      licenseNumber: doctor.licenseNumber,
      phoneNumber: doctor.phoneNumber,
      rating: doctor.rating,
      consultationFee: doctor.consultationFee,
      totalPatients: doctor.totalPatients,
      totalConsultations: doctor.totalConsultations,
      isVerified: doctor.isVerified
    }));

    // Calculate statistics
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const stats = {
      totalDoctors: transformedDoctors.length,
      activeDoctors: transformedDoctors.filter(d => d.lastSignInAt).length,
      inactiveDoctors: transformedDoctors.filter(d => !d.lastSignInAt).length,
      newThisMonth: transformedDoctors.filter(d => new Date(d.createdAt) >= firstDayOfMonth).length,
      verifiedDoctors: transformedDoctors.filter(d => d.isVerified).length,
      totalConsultations: transformedDoctors.reduce((sum, d) => sum + (d.totalConsultations || 0), 0),
      totalPatients: transformedDoctors.reduce((sum, d) => sum + (d.totalPatients || 0), 0)
    };

    return NextResponse.json({
      doctors: transformedDoctors,
      stats,
    });
  } catch (error: any) {
    console.error('Error fetching doctors:', error);
    
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch doctors data' },
      { status: 500 }
    );
  }
}