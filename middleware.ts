import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Protect everything except public pages
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/predict(.*)',
  '/results(.*)',
  '/history(.*)',
  '/analytics(.*)',
  '/settings(.*)',
  '/api/(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // ✅ MUST await auth()
  const { userId } = await auth();

  // Public routes → allow
  if (!isProtectedRoute(req)) {
    return NextResponse.next();
  }

  // Protected routes → require login
  if (!userId) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Run on all routes except static files
    '/((?!_next|.*\\.(?:css|js|png|jpg|jpeg|svg|ico|webp)).*)',
  ],
};
