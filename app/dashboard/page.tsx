import { getCurrentUser, getDashboardUrl } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  // Redirect to role-specific dashboard
  const dashboardUrl = getDashboardUrl(user.role);
  redirect(dashboardUrl);
}