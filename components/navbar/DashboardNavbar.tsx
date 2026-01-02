'use client';

import Link from 'next/link';
import { useUser, SignOutButton, UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { UserRoleBadge } from '@/components/auth/user-role-badge';
import { UserNotifications } from '@/components/user-notifications';
import { Heart, LogOut, Settings, User } from 'lucide-react';

interface DashboardNavbarProps {
  className?: string;
}

export function DashboardNavbar({ className = '' }: DashboardNavbarProps) {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <nav className={`bg-black/70 backdrop-blur-2xl border-b border-gray-700/30 sticky top-0 z-50 shadow-lg shadow-black/20 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Heart className="h-6 w-6 text-white" />
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

  return (
    <nav className={`bg-black/70 backdrop-blur-2xl border-b border-gray-700/30 sticky top-0 z-50 shadow-lg shadow-black/20 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Logo + Title */}
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Cancer Detection</h1>
              <p className="text-xs text-gray-400">Medical Dashboard</p>
            </div>
          </Link>

          {/* Right: User Info + Actions */}
          <div className="flex items-center space-x-4">
            {/* User Info */}
            <div className="hidden md:block text-right">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  {userName}
                </span>
                <UserRoleBadge />
              </div>
              <span className="text-xs text-gray-500">{userEmail}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <UserNotifications />

              {/* Clerk User Button with Custom Styling */}
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8 rounded-full ring-2 ring-gray-600 hover:ring-blue-500 transition-all duration-300",
                    userButtonPopoverCard: "bg-gray-800 border border-gray-700 shadow-2xl",
                    userButtonPopoverActionButton: "text-gray-300 hover:text-white hover:bg-gray-700",
                    userButtonPopoverActionButtonText: "text-gray-300",
                    userButtonPopoverActionButtonIcon: "text-gray-400",
                    userButtonPopoverFooter: "hidden", // Hide the footer
                  }
                }}
                userProfileMode="navigation"
                userProfileUrl="/user-profile"
              >
                <UserButton.MenuItems>
                  <UserButton.Link
                    label="Dashboard"
                    labelIcon={<User className="h-4 w-4" />}
                    href="/dashboard"
                  />
                  <UserButton.Link
                    label="Settings"
                    labelIcon={<Settings className="h-4 w-4" />}
                    href="/settings"
                  />
                  <UserButton.Action label="signOut" />
                </UserButton.MenuItems>
              </UserButton>

              {/* Alternative: Custom Logout Button (if you prefer) */}
              {/* 
              <SignOutButton>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-400 hover:text-white hover:bg-gray-800/50 backdrop-blur-sm transition-all duration-300"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </SignOutButton>
              */}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}