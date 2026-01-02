import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '../../_utils/auth-utils';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    // Verify admin access
    await requireAdmin();

    // Connect to database
    await connectDB();

    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role'); // 'user', 'doctor', 'admin', or 'all'
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');

    // Build query
    let query: any = { isActive: true };

    if (role && role !== 'all') {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }

    // Get users with pagination
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .lean();

    const totalCount = await User.countDocuments(query);

    // Get user statistics
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalDoctors = await User.countDocuments({ role: 'doctor', isActive: true });
    const totalPatients = await User.countDocuments({ role: 'user', isActive: true });
    const verifiedUsers = await User.countDocuments({ isVerified: true, isActive: true });
    
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const newUsersThisMonth = await User.countDocuments({ 
      createdAt: { $gte: firstDayOfMonth },
      isActive: true 
    });

    const stats = {
      totalUsers,
      totalDoctors,
      totalPatients,
      verifiedUsers,
      newUsersThisMonth
    };

    // Get recent activity (last 10 users)
    const recentUsers = await User.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('firstName lastName email role createdAt')
      .lean();

    return NextResponse.json({
      success: true,
      users: users.map(user => ({
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
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
        loginCount: user.loginCount,
        subscription: user.subscription,
        stats: user.stats,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      })),
      stats: {
        ...stats,
        totalActiveUsers: totalCount
      },
      recentUsers: recentUsers.map(user => ({
        id: user._id,
        name: user.role === 'doctor' ? `Dr. ${user.firstName} ${user.lastName}` : `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role,
        joinedAt: user.createdAt
      })),
      pagination: {
        currentPage: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch users data' },
      { status: 500 }
    );
  }
}

// Update user (for admin actions like role changes, etc.)
export async function PATCH(req: NextRequest) {
  try {
    // Verify admin access
    await requireAdmin();

    const { userId, updates } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Update user in MongoDB
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      user: {
        id: updatedUser._id,
        clerkId: updatedUser.clerkId,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        isVerified: updatedUser.isVerified,
        updatedAt: updatedUser.updatedAt
      }
    });
  } catch (error: any) {
    console.error('Error updating user:', error);
    
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}