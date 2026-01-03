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
  '/api/doctor/(.*)',
  '/api/user(.*)',
  '/api/predict(.*)',
  '/api/dashboard(.*)',
  '/api/predictions(.*)',
]);

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/about',
  '/contact',
  '/privacy-policy',
  '/terms-and-conditions',
  '/unauthorized',
  '/api/auth/callback',
  '/api/doctors(.*)',
  '/api/webhooks(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // ✅ FIX: await auth()
  const { userId, sessionClaims } = await auth();
  const { pathname } = req.nextUrl;

  // Allow public routes
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Protect routes
  if (isProtectedRoute(req)) {
    if (!userId) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', pathname);
      return NextResponse.redirect(signInUrl);
    }

    // ✅ EDGE-SAFE role access
    const role =
      (sessionClaims?.publicMetadata as any)?.role || 'user';

    // Role guards
    if (pathname.startsWith('/dashboard/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    if (pathname.startsWith('/dashboard/doctor') && role !== 'doctor') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    if (pathname.startsWith('/dashboard/user') && role !== 'user') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    if (pathname.startsWith('/api/admin') && role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (
      pathname.startsWith('/api/doctor/') &&
      !['doctor', 'admin'].includes(role)
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|.*\\..*).*)',
    '/(api|trpc)(.*)',
  ],
};
