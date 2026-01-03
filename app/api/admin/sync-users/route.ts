export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { createClerkClient } from '@clerk/nextjs/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export async function POST(req: NextRequest) {
  try {
    // Check if user is admin
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await clerkClient.users.getUser(userId);
    if (user.publicMetadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Connect to database
    await connectDB();

    // Get all users from Clerk
    const clerkUsers = await clerkClient.users.getUserList({ limit: 500 });
    
    let syncedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    console.log(`🔄 Starting sync of ${clerkUsers.data.length} users from Clerk`);

    for (const clerkUser of clerkUsers.data) {
      try {
        // Check if user already exists in MongoDB
        const existingUser = await User.findOne({ clerkId: clerkUser.id });
        
        if (existingUser) {
          console.log(`⏭️ User ${clerkUser.id} already exists, skipping`);
          skippedCount++;
          continue;
        }

        // Determine role
        const userRole = (clerkUser.publicMetadata?.role as string) || 'user';

        // Create new user in MongoDB
        const newUser = new User({
          clerkId: clerkUser.id,
          firstName: clerkUser.firstName || '',
          lastName: clerkUser.lastName || '',
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          phoneNumber: clerkUser.phoneNumbers[0]?.phoneNumber || '',
          role: userRole,
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
          },
          lastLoginAt: clerkUser.lastSignInAt ? new Date(clerkUser.lastSignInAt) : undefined,
          loginCount: 0
        });

        await newUser.save();
        console.log(`✅ Synced user: ${clerkUser.firstName} ${clerkUser.lastName} (${clerkUser.emailAddresses[0]?.emailAddress})`);
        syncedCount++;

      } catch (error) {
        console.error(`❌ Error syncing user ${clerkUser.id}:`, error);
        errorCount++;
      }
    }

    console.log(`🎉 Sync completed: ${syncedCount} synced, ${skippedCount} skipped, ${errorCount} errors`);

    return NextResponse.json({
      success: true,
      message: 'User sync completed',
      stats: {
        total: clerkUsers.data.length,
        synced: syncedCount,
        skipped: skippedCount,
        errors: errorCount
      }
    });

  } catch (error) {
    console.error('Error syncing users:', error);
    return NextResponse.json(
      { error: 'Failed to sync users' },
      { status: 500 }
    );
  }
}