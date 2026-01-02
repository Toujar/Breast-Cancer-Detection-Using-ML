import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '../../_utils/auth-utils';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// Update user prediction count
export async function POST(req: NextRequest) {
  try {
    // Verify user is authenticated
    const currentUser = await requireUser();

    const { action, data } = await req.json();

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    const user = await User.findOne({ clerkId: currentUser.id });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      );
    }

    let updatedUser;

    switch (action) {
      case 'increment_predictions':
        updatedUser = await User.findByIdAndUpdate(
          user._id,
          {
            $inc: { 'stats.totalPredictions': 1 },
            'stats.lastPredictionDate': new Date()
          },
          { new: true }
        );
        break;

      case 'increment_consultations':
        updatedUser = await User.findByIdAndUpdate(
          user._id,
          {
            $inc: { 'stats.totalConsultations': 1 },
            'stats.lastConsultationDate': new Date()
          },
          { new: true }
        );
        break;

      case 'update_profile':
        updatedUser = await User.findByIdAndUpdate(
          user._id,
          { ...data, updatedAt: new Date() },
          { new: true, runValidators: true }
        );
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `User ${action} completed successfully`,
      stats: updatedUser?.stats
    });
  } catch (error: any) {
    console.error(`Error updating user stats:`, error);
    
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update user stats' },
      { status: 500 }
    );
  }
}

// Get user stats
export async function GET(req: NextRequest) {
  try {
    // Verify user is authenticated
    const currentUser = await requireUser();

    // Connect to database
    await connectDB();

    const user = await User.findOne({ clerkId: currentUser.id }).lean();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        clerkId: user.clerkId,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.role === 'doctor' ? `Dr. ${user.firstName} ${user.lastName}` : `${user.firstName} ${user.lastName}`,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        profileImage: user.profileImage,
        isVerified: user.isVerified,
        subscription: user.subscription,
        stats: user.stats,
        preferences: user.preferences,
        lastLoginAt: user.lastLoginAt,
        loginCount: user.loginCount,
        createdAt: user.createdAt
      }
    });
  } catch (error: any) {
    console.error('Error fetching user stats:', error);
    
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch user stats' },
      { status: 500 }
    );
  }
}