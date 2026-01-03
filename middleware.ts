import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Routes that REQUIRE authentication
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/predict(.*)',
  '/results(.*)',
  '/history(.*)',
  '/analytics(.*)',
  '/settings(.*)',
  '/api/(.*)',
]);

export default clerkMiddleware((auth, req) => {
  const { userId } = auth();

  // Allow all public routes
  if (!isProtectedRoute(req)) {
    return NextResponse.next();
  }

  // If user is not logged in → redirect to sign-in
  if (!userId) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Run middleware on all routes except:
     * - _next (Next.js internals)
     * - static files (images, css, js, etc.)
     */
    '/((?!_next|.*\\..*).*)',
  ],
};
