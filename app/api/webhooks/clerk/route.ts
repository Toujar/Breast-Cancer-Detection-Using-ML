export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createClerkClient } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Doctor from '@/models/Doctor';

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.text();
  const body = JSON.parse(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occurred', {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === 'user.created') {
    console.log('🔥 Webhook received: user.created');
    
    try {
      // Connect to database
      await connectDB();
      console.log('✅ Connected to MongoDB');

      const userData = evt.data;
      console.log('User data:', JSON.stringify(userData, null, 2));
      
      // Determine role - check if this is a doctor created by admin
      const userRole = (userData.public_metadata?.role as string) || 'user';
      console.log('👤 User role determined:', userRole);
      
      // Automatically assign 'user' role to new signups if no role is set
      if (!userData.public_metadata?.role) {
        console.log('🔧 Updating user metadata with role: user');
        await clerkClient.users.updateUserMetadata(userData.id, {
          publicMetadata: {
            role: 'user',
          },
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ clerkId: userData.id });
      if (existingUser) {
        console.log('⚠️ User already exists in MongoDB:', userData.id);
        return new Response('User already exists', { status: 200 });
      }

      // Save user to MongoDB
      const newUser = new User({
        clerkId: userData.id,
        firstName: userData.first_name || '',
        lastName: userData.last_name || '',
        email: userData.email_addresses[0]?.email_address || '',
        phoneNumber: userData.phone_numbers[0]?.phone_number || '',
        role: userRole,
        profileImage: userData.image_url || null,
        isVerified: userData.email_addresses[0]?.verification?.status === 'verified' || false,
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

      const savedUser = await newUser.save();
      console.log('✅ User saved to MongoDB:', savedUser._id);

      console.log(`🎉 User ${userData.id} created and saved to MongoDB with role: ${userRole}`);
      console.log(`📧 User details: ${userData.first_name} ${userData.last_name} (${userData.email_addresses[0]?.email_address})`);
      
    } catch (error) {
      console.error('❌ Error processing user creation:', error);
      return new Response('Error processing user creation', { status: 500 });
    }
  }

  if (eventType === 'user.updated') {
    try {
      // Connect to database
      await connectDB();

      const userData = evt.data;
      
      // Update user in MongoDB
      await User.findOneAndUpdate(
        { clerkId: userData.id },
        {
          firstName: userData.first_name || '',
          lastName: userData.last_name || '',
          email: userData.email_addresses[0]?.email_address || '',
          phoneNumber: userData.phone_numbers[0]?.phone_number || '',
          profileImage: userData.image_url || null,
          isVerified: userData.email_addresses[0]?.verification?.status === 'verified' || false,
          role: (userData.public_metadata?.role as string) || 'user'
        },
        { upsert: true, new: true }
      );

      // If user is a doctor, also update doctor collection
      if ((userData.public_metadata?.role as string) === 'doctor') {
        await Doctor.findOneAndUpdate(
          { clerkId: userData.id },
          {
            firstName: userData.first_name || '',
            lastName: userData.last_name || '',
            email: userData.email_addresses[0]?.email_address || '',
            phoneNumber: userData.phone_numbers[0]?.phone_number || ''
          }
        );
      }

      console.log(`User ${userData.id} updated in MongoDB`);
      
    } catch (error) {
      console.error('Error updating user:', error);
      return new Response('Error updating user', { status: 500 });
    }
  }

  if (eventType === 'user.deleted') {
    try {
      // Connect to database
      await connectDB();

      const userData = evt.data;
      
      // Soft delete user in MongoDB
      await User.findOneAndUpdate(
        { clerkId: userData.id },
        { 
          isActive: false,
          deletedAt: new Date()
        }
      );

      // If user was a doctor, also soft delete from doctor collection
      await Doctor.findOneAndUpdate(
        { clerkId: userData.id },
        { 
          isActive: false,
          deletedAt: new Date()
        }
      );

      console.log(`User ${userData.id} soft deleted from MongoDB`);
      
    } catch (error) {
      console.error('Error deleting user:', error);
      return new Response('Error deleting user', { status: 500 });
    }
  }

  if (eventType === 'session.created') {
    try {
      // Connect to database
      await connectDB();

      const sessionData = evt.data;
      
      // Update user login stats
      await User.findOneAndUpdate(
        { clerkId: sessionData.user_id },
        { 
          lastLoginAt: new Date(),
          $inc: { loginCount: 1 }
        }
      );

      console.log(`User ${sessionData.user_id} login recorded`);
      
    } catch (error) {
      console.error('Error updating login stats:', error);
      // Don't return error for login stats as it's not critical
    }
  }

  return new Response('', { status: 200 });
}