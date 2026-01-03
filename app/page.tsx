
// Force dynamic rendering for authentication
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { redirect } from 'next/navigation';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getDashboardUrl } from '@/lib/auth-client';
import { HomePageClient } from '@/components/home-page-client';

export default async function Home() {
  // Check authentication on server side
  const { userId } = await auth();
  
  if (userId) {
    // User is authenticated, get their role and redirect
    const user = await currentUser();
    const role = (user?.publicMetadata?.role as string) || 'user';
    const dashboardUrl = getDashboardUrl(role as any);
    redirect(dashboardUrl);
  }

  // User is not authenticated, show the landing page
  return <HomePageClient />;
}