'use client';

import Link from 'next/link';
import { useUser, SignOutButton, UserButton } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { UserRoleBadge } from '@/components/auth/user-role-badge';
import { UserNotifications } from '@/components/user-notifications';
import { 
  Heart, 
  LogOut, 
  Settings, 
  User, 
  BarChart3, 
  History, 
  Upload,
  Users,
  Shield,
  Home
} from 'lucide-react';

interface EnhancedNavbarProps {
  className?: string;
  showNavigation?: boolean;
}

export function EnhancedNavbar({ className = '', showNavigation = true }: EnhancedNavbarProps) {
  const { user, isLoaded } = useUser();
  const pathname = usePathname();

  if (!isLoaded) {
    return (
      <nav className={`bg-black/70 backdrop-blur-2xl border-b border-gray-700/30 sticky top-0 z-50 shadow-lg shadow-black/20 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Heart className="h-6 w-6 text-white animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Cancer Detection</h1>
                <p className="text-xs text-gray-400">Medical Dashboard</p>
              </div>
            </div>
            <div className="animate-pulse">
              <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  if (!user) {
    return null;
  }

  const userName = user.firstName || user.emailAddresses[0]?.emailAddress?.split('@')[0] || 'User';
  const userEmail = user.emailAddresses[0]?.emailAddress || '';
  const userRole = (user.publicMetadata?.role as string) || 'user';

  // Navigation items based on user role
  const getNavigationItems = () => {
    const baseItems = [
      { href: '/dashboard', label: 'Dashboard', icon: Home },
      { href: '/history', label: 'History', icon: History },
      { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    ];

    if (userRole === 'admin') {
      baseItems.push(
        { href: '/dashboard/admin', label: 'Admin', icon: Shield },
        { href: '/dashboard/admin/doctors', label: 'Manage Doctors', icon: Users }
      );
    } else if (userRole === 'doctor') {
      baseItems.push(
        { href: '/dashboard/doctor', label: 'Doctor Panel', icon: Users }
      );
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  return (
    <nav className={`bg-black/70 backdrop-blur-2xl border-b border-gray-700/30 sticky top-0 z-50 shadow-lg shadow-black/20 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Logo + Title */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Cancer Detection</h1>
                <p className="text-xs text-gray-400">Medical Dashboard</p>
              </div>
            </Link>
          </div>

          {/* Right: Navigation + Actions */}
          <div className="flex items-center space-x-6">
            {/* Navigation Links */}
            {showNavigation && (
              <div className="hidden lg:flex items-center space-x-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  // Special handling for manage doctors - highlight when on /dashboard/admin/doctors or /dashboard/admin/create-doctor
                  let isActive = pathname === item.href;
                  
                  if (item.href === '/dashboard/admin/doctors') {
                    isActive = pathname === item.href || pathname.startsWith('/dashboard/admin/doctors') || pathname === '/dashboard/admin/create-doctor';
                  } else if (item.href === '/dashboard/admin') {
                    // Only highlight admin when exactly on /dashboard/admin, not on sub-pages
                    isActive = pathname === '/dashboard/admin';
                  } else {
                    isActive = pathname === item.href || (pathname.startsWith(item.href + '/') && item.href !== '/dashboard');
                  }
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-600/20 text-blue-400 shadow-lg shadow-blue-500/20'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              {/* Notifications - Consistent with other buttons */}
              <UserNotifications />

              {/* Role Badge */}
              <UserRoleBadge />

              {/* Clerk User Button with Enhanced Styling */}
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9 rounded-full ring-2 ring-gray-600 hover:ring-blue-500 transition-all duration-300 shadow-lg hover:shadow-xl",
                    userButtonPopoverCard: "bg-gray-800/95 backdrop-blur-xl border border-gray-700/50 shadow-2xl rounded-xl",
                    userButtonPopoverActionButton: "text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200",
                    userButtonPopoverActionButtonText: "text-gray-300 font-medium",
                    userButtonPopoverActionButtonIcon: "text-gray-400",
                    userButtonPopoverFooter: "border-t border-gray-700/50 bg-gray-800/50",
                    userButtonPopoverActions: "space-y-1 p-2",
                  }
                }}
                userProfileMode="navigation"
                userProfileUrl="/user-profile"
              >
                <UserButton.MenuItems>
                  <UserButton.Link
                    label="App Settings"
                    labelIcon={<Settings className="h-4 w-4" />}
                    href="/settings"
                  />
                </UserButton.MenuItems>
              </UserButton>
            </div>
          </div>
        </div>

        {/* Mobile Navigation - Collapsible */}
        {showNavigation && (
          <div className="lg:hidden border-t border-gray-700/30 py-2">
            <div className="flex items-center space-x-1 overflow-x-auto">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                // Special handling for manage doctors - highlight when on /dashboard/admin/doctors or /dashboard/admin/create-doctor
                let isActive = pathname === item.href;
                
                if (item.href === '/dashboard/admin/doctors') {
                  isActive = pathname === item.href || pathname.startsWith('/dashboard/admin/doctors') || pathname === '/dashboard/admin/create-doctor';
                } else if (item.href === '/dashboard/admin') {
                  // Only highlight admin when exactly on /dashboard/admin, not on sub-pages
                  isActive = pathname === '/dashboard/admin';
                } else {
                  isActive = pathname === item.href || (pathname.startsWith(item.href + '/') && item.href !== '/dashboard');
                }
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-600/20 text-blue-400 shadow-lg shadow-blue-500/20'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}