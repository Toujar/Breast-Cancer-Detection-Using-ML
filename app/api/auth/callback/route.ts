import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClerkClient } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export async function GET(req: NextRequest) {
  try {
    // Get authenticated user from Clerk
    const { userId } = await auth();
    
    if (!userId) {
      console.log('❌ No userId from Clerk auth in callback');
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }

    console.log('✅ User authenticated in callback:', userId);

    // Get user details from Clerk
    const user = await clerkClient.users.getUser(userId);
    const userRole = (user.publicMetadata?.role as string) || 'user';

    console.log('✅ User role determined:', userRole);

    // Determine redirect URL based on role
    let redirectUrl: string;
    
    switch (userRole) {
      case 'admin':
        redirectUrl = '/dashboard/admin';
        break;
      case 'doctor':
        redirectUrl = '/dashboard/doctor';
        break;
      case 'user':
      default:
        redirectUrl = '/dashboard/user';
        break;
    }

    console.log('✅ Redirecting to:', redirectUrl);

    // Redirect to appropriate dashboard
    return NextResponse.redirect(new URL(redirectUrl, req.url));

  } catch (error) {
    console.error('❌ Auth callback error:', error);
    // Fallback to user dashboard on error
    return NextResponse.redirect(new URL('/dashboard/user', req.url));
  }
}