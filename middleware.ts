import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/predict(.*)',
  '/results(.*)',
  '/history(.*)',
  '/analytics(.*)',
  '/settings(.*)',
  '/api/admin(.*)',
  '/api/dashboard(.*)',
  '/api/predict(.*)',
  '/api/predictions(.*)',
  '/api/appointments(.*)',
  '/api/users(.*)',
  '/api/results(.*)', // Results API should be protected
]);

// Define public routes that should never be protected
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/about',
  '/contact',
  '/privacy-policy',
  '/terms-and-conditions',
  '/help',
  '/research',
  '/documentation',
  '/unauthorized',
  '/api/webhooks(.*)', // Webhooks must be public
  '/api/doctors(.*)', // Public doctor listings
  '/api/auth(.*)', // Auth callbacks must be public
]);

export default clerkMiddleware(async (auth, req) => {
  try {
    const { pathname } = req.nextUrl;

    // Always allow public routes
    if (isPublicRoute(req)) {
      return NextResponse.next();
    }

    // Check if route needs protection
    if (isProtectedRoute(req)) {
      const { userId } = await auth();

      if (!userId) {
        // Preserve the intended destination for redirect after login
        const signInUrl = new URL('/sign-in', req.url);
        if (pathname !== '/sign-in' && pathname !== '/sign-up') {
          signInUrl.searchParams.set('redirect_url', pathname);
        }
        return NextResponse.redirect(signInUrl);
      }

      // For admin API routes, we'll let the API route itself handle role validation
      // This keeps middleware fast and moves authorization logic to the appropriate layer
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    // On auth error, redirect to sign-in to be safe
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }
});

export const config = {
  matcher: [
    // Only run middleware on routes that might need protection
    // Exclude static files and Next.js internals
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
};
