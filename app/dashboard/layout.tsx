import { requireAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();

  // Redirect to appropriate dashboard if accessing base /dashboard
  if (!children) {
    redirect(`/dashboard/${user.role}`);
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {children}
    </div>
  );
}