export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createClerkClient } from '@clerk/nextjs/server';
import { requireAdmin } from '../../../_utils/auth-utils';
import connectDB from '@/lib/mongodb';
import Doctor from '@/models/Doctor';

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin access
    await requireAdmin();

    const doctorId = params.id;

    // Connect to database
    await connectDB();

    // Find doctor in MongoDB first
    const mongoDoctor = await Doctor.findOne({ clerkId: doctorId });
    
    if (!mongoDoctor) {
      return NextResponse.json(
        { error: 'Doctor not found in database' },
        { status: 404 }
      );
    }

    // Verify the user exists in Clerk and is a doctor
    const user = await clerkClient.users.getUser(doctorId);
    
    if ((user.publicMetadata?.role as string) !== 'doctor') {
      return NextResponse.json(
        { error: 'User is not a doctor or does not exist' },
        { status: 400 }
      );
    }

    // Soft delete in MongoDB (set isActive to false instead of hard delete)
    await Doctor.findByIdAndUpdate(mongoDoctor._id, { 
      isActive: false,
      deletedAt: new Date()
    });

    // Delete the doctor account from Clerk
    await clerkClient.users.deleteUser(doctorId);

    return NextResponse.json({
      message: 'Doctor account deleted successfully',
      deletedId: doctorId,
      mongoId: mongoDoctor._id,
    });
  } catch (error: any) {
    console.error('Error deleting doctor:', error);
    
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    if (error.status === 404) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete doctor account' },
      { status: 500 }
    );
  }
}