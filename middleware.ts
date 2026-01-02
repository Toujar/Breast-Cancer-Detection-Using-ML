import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { createClerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define protected routes
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/predict(.*)',
  '/results(.*)',
  '/history(.*)',
  '/analytics(.*)',
  '/settings(.*)',
  '/api/admin(.*)',
  '/api/doctor/(.*)', // More specific pattern to avoid matching /api/doctors
  '/api/user(.*)',
  '/api/predict(.*)',
  '/api/dashboard(.*)',
  '/api/predictions(.*)',
]);

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/about',
  '/contact',
  '/privacy-policy',
  '/terms-and-conditions',
  '/unauthorized',
  '/api/auth/callback', // Add auth callback to public routes
  '/api/doctors(.*)', // Make doctors API public
  '/api/webhooks(.*)', // Make webhooks public
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const { pathname } = req.nextUrl;

  // Allow public routes
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Protect routes that require authentication
  if (isProtectedRoute(req)) {
    if (!userId) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Get user role directly from Clerk API since session claims don't include publicMetadata
    let role = 'user'; // default
    
    try {
      const clerkClient = createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY,
      });
      
      const user = await clerkClient.users.getUser(userId);
      role = (user.publicMetadata?.role as string) || 'user';
      
      console.log('Middleware - User ID:', userId);
      console.log('Middleware - User Email:', user.emailAddresses[0]?.emailAddress);
      console.log('Middleware - Public Metadata:', user.publicMetadata);
      console.log('Middleware - Extracted Role:', role);
      console.log('Middleware - Pathname:', pathname);
    } catch (error) {
      console.error('Middleware - Error fetching user:', error);
      // Continue with default role if API call fails
    }

    // Role-based route protection (only for specific dashboard routes)
    if (pathname.startsWith('/dashboard/user') && role !== 'user') {
      console.log('Blocking access to user dashboard for role:', role);
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
    
    if (pathname.startsWith('/dashboard/doctor') && role !== 'doctor') {
      console.log('Blocking access to doctor dashboard for role:', role);
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
    
    if (pathname.startsWith('/dashboard/admin') && role !== 'admin') {
      console.log('Blocking access to admin dashboard for role:', role);
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    // Note: /predict, /results, /history, /analytics, /settings are accessible to all authenticated users

    // Protect admin APIs
    if (pathname.startsWith('/api/admin') && role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Protect doctor APIs (but not doctors API which is public)
    if (pathname.startsWith('/api/doctor/') && !['doctor', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};