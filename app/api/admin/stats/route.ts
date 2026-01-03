export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createClerkClient } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import Result from '@/models/Result';
import User from '@/models/User';
import Doctor from '@/models/Doctor';
import { requireAdmin } from '../../_utils/auth-utils';

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export async function GET() {
  try {
    // Verify admin access
    await requireAdmin();

    // Connect to database
    await connectDB();

    // Get current date and time calculations
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Get user statistics from MongoDB
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalDoctorsFromUsers = await User.countDocuments({ role: 'doctor', isActive: true });
    const totalPatients = await User.countDocuments({ role: 'user', isActive: true });
    const verifiedUsers = await User.countDocuments({ isVerified: true, isActive: true });
    const newUsersThisMonth = await User.countDocuments({ 
      createdAt: { $gte: firstDayOfMonth },
      isActive: true 
    });

    // Get doctor statistics from Doctor collection
    const totalDoctors = await Doctor.countDocuments({ isActive: true });
    const verifiedDoctors = await Doctor.countDocuments({ isActive: true, isVerified: true });
    
    // Calculate this month's growth
    const usersLastMonth = await User.countDocuments({ 
      createdAt: { $gte: lastMonth, $lt: firstDayOfMonth },
      isActive: true 
    });
    
    const growthPercentage = usersLastMonth > 0 
      ? Math.round(((newUsersThisMonth - usersLastMonth) / usersLastMonth) * 100)
      : newUsersThisMonth > 0 ? 100 : 0;

    // Fetch prediction statistics from database
    const totalPredictions = await Result.countDocuments();
    const predictionsThisMonth = await Result.countDocuments({
      createdAt: { $gte: firstDayOfMonth }
    });

    // Get recent system activity from multiple sources
    const recentPredictions = await Result.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select('type prediction confidence createdAt userId')
      .lean();

    const recentUsers = await User.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(3)
      .select('firstName lastName role createdAt')
      .lean();

    const recentDoctors = await Doctor.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(2)
      .select('firstName lastName specialization createdAt')
      .lean();

    // Combine recent activity
    const recentActivity = [
      ...recentPredictions.map(pred => ({
        type: 'prediction',
        message: `New ${pred.type} prediction: ${pred.prediction}`,
        timestamp: pred.createdAt,
        confidence: pred.confidence
      })),
      ...recentUsers.map(user => ({
        type: 'user_registered',
        message: `New ${user.role} registered: ${user.firstName} ${user.lastName}`,
        timestamp: user.createdAt,
      })),
      ...recentDoctors.map(doctor => ({
        type: 'doctor_created',
        message: `New doctor added: Dr. ${doctor.firstName} ${doctor.lastName} (${doctor.specialization})`,
        timestamp: doctor.createdAt,
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);

    const stats = {
      totalUsers,
      totalDoctors: Math.max(totalDoctors, totalDoctorsFromUsers), // Use the higher count
      totalPatients,
      activeDoctors: verifiedDoctors,
      totalPredictions: predictionsThisMonth,
      growthPercentage: `+${growthPercentage}%`,
      verifiedUsers,
      newUsersThisMonth,
      totalPredictionsAllTime: totalPredictions,
      recentActivity: recentActivity.map(activity => ({
        ...activity,
        timeAgo: getTimeAgo(new Date(activity.timestamp))
      }))
    };

    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch admin statistics' },
      { status: 500 }
    );
  }
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return date.toLocaleDateString();
}