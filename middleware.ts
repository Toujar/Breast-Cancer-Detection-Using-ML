import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/predict(.*)',
  '/results(.*)',
  '/history(.*)',
  '/analytics(.*)',
  '/settings(.*)',
  '/api/admin(.*)',
  '/api/doctor(.*)',
  '/api/user(.*)',
  '/api/predict(.*)',
  '/api/dashboard(.*)',
  '/api/predictions(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isProtectedRoute(req)) {
    // ⬅️ THIS IS THE KEY LINE
    return NextResponse.next();
  }

  const { userId } = await auth();

  if (!userId) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Only run middleware where needed
    '/dashboard/:path*',
    '/predict/:path*',
    '/results/:path*',
    '/history/:path*',
    '/analytics/:path*',
    '/settings/:path*',
    '/api/:path*',
  ],
};