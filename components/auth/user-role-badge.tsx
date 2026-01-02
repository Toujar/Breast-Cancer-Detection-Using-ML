'use client';

import { useUser } from '@clerk/nextjs';
import { UserRole } from '@/lib/auth-client';

interface UserRoleBadgeProps {
  className?: string;
}

export function UserRoleBadge({ className = '' }: UserRoleBadgeProps) {
  const { user } = useUser();
  
  if (!user) return null;

  const role = (user.publicMetadata?.role as UserRole) || 'user';
  
  const roleColors = {
    user: 'bg-blue-600 text-blue-100',
    doctor: 'bg-green-600 text-green-100',
    admin: 'bg-purple-600 text-purple-100',
  };

  const roleLabels = {
    user: 'Patient',
    doctor: 'Doctor',
    admin: 'Admin',
  };

  return (
    <span className={`px-2 py-1 text-xs rounded-full uppercase font-medium ${roleColors[role]} ${className}`}>
      {roleLabels[role]}
    </span>
  );
}