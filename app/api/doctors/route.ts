import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Doctor from '@/models/Doctor';

export async function GET(req: NextRequest) {
  try {
    // Connect to database
    await connectDB();

    const { searchParams } = new URL(req.url);
    const location = searchParams.get('location');
    const specialization = searchParams.get('specialization');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');

    // Build query
    let query: any = { isActive: true, isVerified: true };

    if (location && location !== 'all') {
      query.location = new RegExp(location, 'i');
    }

    if (specialization && specialization !== 'all') {
      query.specialization = new RegExp(specialization, 'i');
    }

    if (search) {
      query.$or = [
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') },
        { specialization: new RegExp(search, 'i') },
        { hospital: new RegExp(search, 'i') },
        { location: new RegExp(search, 'i') }
      ];
    }

    // Get doctors with pagination and sorting
    const doctors = await Doctor.find(query)
      .sort({ rating: -1, experience: -1, totalConsultations: -1 })
      .limit(limit)
      .skip(offset)
      .lean();

    const totalCount = await Doctor.countDocuments(query);

    // Get unique locations and specializations for filters
    const locations = await Doctor.distinct('location', { isActive: true, isVerified: true });
    const specializations = await Doctor.distinct('specialization', { isActive: true, isVerified: true });

    return NextResponse.json({
      success: true,
      doctors: doctors.map((doctor) => ({
        id: doctor._id,
        clerkId: doctor.clerkId,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        fullName: `Dr. ${doctor.firstName} ${doctor.lastName}`,
        email: doctor.email,
        phoneNumber: doctor.phoneNumber,
        specialization: doctor.specialization,
        qualification: doctor.qualification,
        experience: doctor.experience,
        licenseNumber: doctor.licenseNumber,
        hospital: doctor.hospital,
        location: doctor.location,
        rating: doctor.rating,
        consultationFee: doctor.consultationFee,
        totalPatients: doctor.totalPatients,
        totalConsultations: doctor.totalConsultations,
        languages: doctor.languages,
        profileImage: doctor.profileImage,
        bio: doctor.bio,
        availableSlots: doctor.availableSlots,
        awards: doctor.awards,
        isVerified: doctor.isVerified,
        createdAt: doctor.createdAt
      })),
      totalCount,
      hasMore: offset + limit < totalCount,
      filters: {
        locations: locations.sort(),
        specializations: specializations.sort()
      },
      pagination: {
        currentPage: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(totalCount / limit),
        limit,
        offset
      }
    });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch doctors' },
      { status: 500 }
    );
  }
}

// Get doctor by ID or Clerk ID
export async function POST(req: NextRequest) {
  try {
    const { doctorId, clerkId } = await req.json();

    if (!doctorId && !clerkId) {
      return NextResponse.json(
        { error: 'Doctor ID or Clerk ID is required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    let doctor;
    
    if (clerkId) {
      // Find doctor by Clerk ID
      doctor = await Doctor.findOne({ clerkId, isActive: true, isVerified: true }).lean();
    } else {
      // Find doctor by MongoDB ID
      doctor = await Doctor.findById(doctorId).lean();
    }

    if (!doctor || !doctor.isActive || !doctor.isVerified) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      doctor: {
        id: doctor._id,
        clerkId: doctor.clerkId,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        fullName: `Dr. ${doctor.firstName} ${doctor.lastName}`,
        email: doctor.email,
        phoneNumber: doctor.phoneNumber,
        specialization: doctor.specialization,
        qualification: doctor.qualification,
        experience: doctor.experience,
        licenseNumber: doctor.licenseNumber,
        hospital: doctor.hospital,
        location: doctor.location,
        rating: doctor.rating,
        consultationFee: doctor.consultationFee,
        totalPatients: doctor.totalPatients,
        totalConsultations: doctor.totalConsultations,
        languages: doctor.languages,
        profileImage: doctor.profileImage,
        bio: doctor.bio,
        availableSlots: doctor.availableSlots,
        awards: doctor.awards,
        isVerified: doctor.isVerified,
        createdAt: doctor.createdAt
      }
    });
  } catch (error) {
    console.error('Error fetching doctor:', error);
    return NextResponse.json(
      { error: 'Failed to fetch doctor details' },
      { status: 500 }
    );
  }
}