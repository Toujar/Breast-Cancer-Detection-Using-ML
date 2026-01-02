'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { UserRole } from '@/lib/auth-client';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export function RoleGuard({ 
  allowedRoles, 
  children, 
  fallback = null,
  redirectTo = '/unauthorized'
}: RoleGuardProps) {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && user) {
      const userRole = user.publicMetadata?.role as UserRole || 'user';
      
      if (!allowedRoles.includes(userRole)) {
        router.push(redirectTo);
      }
    }
  }, [isLoaded, user, allowedRoles, redirectTo, router]);

  // Show loading state while checking authentication
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Show fallback if user is not authenticated
  if (!user) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Authentication Required</h2>
          <p className="text-gray-400">Please sign in to access this page.</p>
        </div>
      </div>
    );
  }

  const userRole = user.publicMetadata?.role as UserRole || 'user';

  // Show fallback if user doesn't have required role
  if (!allowedRoles.includes(userRole)) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400">You don't have permission to access this resource.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}