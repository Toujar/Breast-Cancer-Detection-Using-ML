// Client-side authentication utilities
export type UserRole = 'user' | 'doctor' | 'admin';

/**
 * Get dashboard URL based on user role (client-side version)
 */
export function getDashboardUrl(role: UserRole): string {
  switch (role) {
    case 'user':
      return '/dashboard/user';
    case 'doctor':
      return '/dashboard/doctor';
    case 'admin':
      return '/dashboard/admin';
    default:
      return '/dashboard/user';
  }
}

/**
 * Check if user has specific role (client-side version)
 */
export function hasRole(userRole: string | undefined, role: UserRole): boolean {
  return userRole === role;
}

/**
 * Check if user has any of the specified roles (client-side version)
 */
export function hasAnyRole(userRole: string | undefined, roles: UserRole[]): boolean {
  return userRole ? roles.includes(userRole as UserRole) : false;
}