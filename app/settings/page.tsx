'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { EnhancedNavbar } from '@/components/navbar/EnhancedNavbar';
import {
  Settings,
  User,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Heart,
  Shield,
  Bell,
  Key,
  Calendar,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in');
      return;
    }
  }, [isLoaded, user, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const userName = user.firstName || user.emailAddresses[0]?.emailAddress?.split('@')[0] || 'User';
  const userEmail = user.emailAddresses[0]?.emailAddress || '';
  const userRole = (user.publicMetadata?.role as string) || 'user';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Enhanced Navigation with Clerk Integration */}
      <EnhancedNavbar />

      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent mb-4">
            Account Settings
          </h1>
          <p className="text-gray-400 text-lg">
            Manage your profile information and account preferences
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${message.includes('successfully')
            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
            : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
            {message.includes('successfully') ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span>{message}</span>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Profile Information */}
          <Card className="border border-gray-700/30 shadow-2xl bg-gray-800/50 backdrop-blur-xl">
            <CardHeader className="border-b border-gray-700/30">
              <CardTitle className="flex items-center space-x-2 text-white">
                <User className="h-6 w-6 text-blue-400" />
                <span>Profile Information</span>
              </CardTitle>
              <CardDescription className="text-gray-400">
                Your account details managed by Clerk authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="flex items-center space-x-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700/30">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-lg flex items-center justify-center border border-blue-500/30">
                    <User className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-400">Display Name</Label>
                    <p className="text-white font-semibold">{userName}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700/30">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-lg flex items-center justify-center border border-green-500/30">
                    <Mail className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-400">Email Address</Label>
                    <p className="text-white font-semibold">{userEmail}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700/30">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center border border-purple-500/30">
                    <Shield className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-400">Account Role</Label>
                    <Badge className={`mt-1 ${
                      userRole === 'admin' 
                        ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border border-yellow-500/30' 
                        : userRole === 'doctor'
                        ? 'bg-gradient-to-r from-green-500/20 to-teal-500/20 text-green-400 border border-green-500/30'
                        : 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-400 border border-blue-500/30'
                    }`}>
                      {userRole === 'admin' ? '👑 Admin' : userRole === 'doctor' ? '🩺 Doctor' : '👤 User'}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700/30">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-lg flex items-center justify-center border border-orange-500/30">
                    <Calendar className="h-6 w-6 text-orange-400" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-400">Member Since</Label>
                    <p className="text-white font-semibold">
                      {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="h-5 w-5 text-blue-400" />
                    <span className="text-blue-400 font-semibold">Clerk Authentication</span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Your profile is managed by Clerk's secure authentication system. 
                    To update your personal information, use the user menu in the top-right corner.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security & Privacy */}
          <Card className="border border-gray-700/30 shadow-2xl bg-gray-800/50 backdrop-blur-xl">
            <CardHeader className="border-b border-gray-700/30">
              <CardTitle className="flex items-center space-x-2 text-white">
                <Shield className="h-6 w-6 text-red-400" />
                <span>Security & Privacy</span>
              </CardTitle>
              <CardDescription className="text-gray-400">
                Account security and privacy settings
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700/30">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-lg flex items-center justify-center border border-green-500/30">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">Two-Factor Authentication</p>
                      <p className="text-gray-400 text-sm">Enhanced account security</p>
                    </div>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400 border border-green-500/30">
                    Available via Clerk
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700/30">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-lg flex items-center justify-center border border-blue-500/30">
                      <Key className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">Password Management</p>
                      <p className="text-gray-400 text-sm">Change your password securely</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    Managed by Clerk
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700/30">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center border border-purple-500/30">
                      <Bell className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">Email Notifications</p>
                      <p className="text-gray-400 text-sm">Manage notification preferences</p>
                    </div>
                  </div>
                  <Badge className="bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    Configurable
                  </Badge>
                </div>

                <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                    <span className="text-yellow-400 font-semibold">Security Notice</span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    For advanced security settings including password changes, two-factor authentication, 
                    and account recovery options, please use the Clerk user profile accessible from the user menu.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Status */}
        <Card className="border border-gray-700/30 shadow-2xl bg-gray-800/50 backdrop-blur-xl mt-8">
          <CardHeader className="border-b border-gray-700/30">
            <CardTitle className="flex items-center space-x-2 text-white">
              <Heart className="h-6 w-6 text-pink-400" />
              <span>Account Status</span>
            </CardTitle>
            <CardDescription className="text-gray-400">
              Current account information and status
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gray-900/50 rounded-lg border border-gray-700/30">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-lg flex items-center justify-center mx-auto mb-3 border border-green-500/30">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
                <p className="text-white font-semibold mb-1">Account Status</p>
                <Badge className="bg-green-500/20 text-green-400 border border-green-500/30">
                  Active
                </Badge>
              </div>

              <div className="text-center p-4 bg-gray-900/50 rounded-lg border border-gray-700/30">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-lg flex items-center justify-center mx-auto mb-3 border border-blue-500/30">
                  <Shield className="h-6 w-6 text-blue-400" />
                </div>
                <p className="text-white font-semibold mb-1">Security Level</p>
                <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  High
                </Badge>
              </div>

              <div className="text-center p-4 bg-gray-900/50 rounded-lg border border-gray-700/30">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center mx-auto mb-3 border border-purple-500/30">
                  <Heart className="h-6 w-6 text-purple-400" />
                </div>
                <p className="text-white font-semibold mb-1">Platform Access</p>
                <Badge className="bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  Full Access
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}