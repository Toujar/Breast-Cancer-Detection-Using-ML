'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { DoctorDashboard } from '@/components/doctor-dashboard';
import { EnhancedNavbar } from '@/components/navbar/EnhancedNavbar';

export default function DoctorPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/sign-in');
    return null;
  }

  const userRole = (user.publicMetadata?.role as string) || 'user';

  if (userRole !== 'doctor') {
    router.push('/unauthorized');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <EnhancedNavbar />
      <div className="pt-6">
        <DoctorDashboard />
      </div>
    </div>
  );
}