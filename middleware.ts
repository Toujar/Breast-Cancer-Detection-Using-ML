import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const pathname = req.nextUrl.pathname;

  // ✅ ALWAYS allow home page
  if (pathname === '/') {
    return NextResponse.next();
  }

  // Public pages
  if (
    pathname.startsWith('/sign-in') ||
    pathname.startsWith('/sign-up') ||
    pathname.startsWith('/about') ||
    pathname.startsWith('/contact') ||
    pathname.startsWith('/privacy-policy') ||
    pathname.startsWith('/terms-and-conditions')
  ) {
    return NextResponse.next();
  }

  // Protect dashboards & APIs
  if (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/predict') ||
    pathname.startsWith('/results') ||
    pathname.startsWith('/api')
  ) {
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};
