'use client';

import Link from 'next/link';
import { useUser, SignInButton, UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { UserRoleBadge } from '@/components/auth/user-role-badge';
import { getDashboardUrl } from '@/lib/auth-client';
import { Heart, LogIn } from 'lucide-react';

interface MainNavbarProps {
  className?: string;
}

export function MainNavbar({ className = '' }: MainNavbarProps) {
  const { user, isLoaded } = useUser();

  const getDashboardLink = () => {
    if (!user) return '/sign-in';
    const role = (user.publicMetadata?.role as string) || 'user';
    return getDashboardUrl(role as any);
  };

  return (
    <nav className={`bg-black/80 backdrop-blur-md border-b border-gray-700/30 sticky top-0 z-50 shadow-md ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Logo + Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
              <Heart className="h-6 w-6 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">AI Cancer Detection</h1>
              <p className="text-xs text-gray-400">Medical AI Platform</p>
            </div>
          </div>

          {/* Right: Auth buttons */}
          <div className="flex items-center space-x-4">
            {isLoaded && user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-300 hidden sm:block">
                  Welcome, {user.firstName || user.emailAddresses[0]?.emailAddress?.split('@')[0]}
                </span>
                <UserRoleBadge className="hidden sm:inline-flex" />
                <Link href={getDashboardLink()}>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white hover:from-blue-500 hover:to-indigo-500 transition-all shadow-md"
                  >
                    Dashboard
                  </Button>
                </Link>
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8 rounded-full ring-2 ring-gray-600 hover:ring-blue-500 transition-all duration-300",
                      userButtonPopoverCard: "bg-gray-800 border border-gray-700 shadow-2xl",
                      userButtonPopoverActionButton: "text-gray-300 hover:text-white hover:bg-gray-700",
                      userButtonPopoverActionButtonText: "text-gray-300",
                      userButtonPopoverActionButtonIcon: "text-gray-400",
                    }
                  }}
                />
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <SignInButton mode="modal">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-indigo-500 text-indigo-400 hover:bg-indigo-900/20 transition-all"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                </SignInButton>
                <Link href="/sign-up">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-green-400 to-teal-500 text-white hover:from-teal-500 hover:to-green-400 transition-all shadow-md"
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}