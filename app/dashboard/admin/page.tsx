'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Users, UserPlus, Activity, Shield, Database, TrendingUp, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EnhancedNavbar } from '@/components/navbar/EnhancedNavbar';
import Link from 'next/link';
import { toast } from 'sonner';

interface AdminStats {
  totalUsers: number;
  activeDoctors: number;
  totalPredictions: number;
  growthPercentage: string;
  recentActivity: Array<{
    type: string;
    message: string;
    timeAgo: string;
    confidence?: number;
  }>;
}

export default function AdminDashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeDoctors: 0,
    totalPredictions: 0,
    growthPercentage: '+0%',
    recentActivity: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (isLoaded && user) {
      fetchAdminStats();
    }
  }, [isLoaded, user]);

  const fetchAdminStats = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/stats');
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        toast.error('Failed to fetch admin statistics');
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      toast.error('Error loading admin data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAdminStats();
    setIsRefreshing(false);
    toast.success('Data refreshed successfully');
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <EnhancedNavbar />
      
      <div className="max-w-7xl mx-auto p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-lg p-6 border border-gray-700/30">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent mb-2">
                  Admin Dashboard
                </h1>
                <p className="text-gray-300">
                  Manage the breast cancer detection system, create doctor accounts, and monitor system usage.
                </p>
              </div>
              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* System Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border border-gray-700/30 shadow-2xl bg-gray-800/50 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Users</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                      {stats.totalUsers.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-lg flex items-center justify-center border border-blue-500/30">
                    <Users className="h-6 w-6 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-700/30 shadow-2xl bg-gray-800/50 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Active Doctors</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
                      {stats.activeDoctors}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-lg flex items-center justify-center border border-green-500/30">
                    <Shield className="h-6 w-6 text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-700/30 shadow-2xl bg-gray-800/50 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Scans Processed</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      {stats.totalPredictions.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center border border-purple-500/30">
                    <Database className="h-6 w-6 text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-700/30 shadow-2xl bg-gray-800/50 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">This Month</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                      {stats.growthPercentage}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg flex items-center justify-center border border-yellow-500/30">
                    <TrendingUp className="h-6 w-6 text-yellow-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Admin Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/dashboard/admin/create-doctor" className="group">
              <Card className="border border-gray-700/30 shadow-2xl bg-gray-800/50 backdrop-blur-xl hover:bg-gray-800/70 transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-lg flex items-center justify-center border border-green-500/30">
                      <UserPlus className="h-6 w-6 text-green-400" />
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border border-green-500/30">
                      Create New
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Create Doctor Account
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Add new medical professionals to the system
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/dashboard/admin/doctors" className="group">
              <Card className="border border-gray-700/30 shadow-2xl bg-gray-800/50 backdrop-blur-xl hover:bg-gray-800/70 transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-lg flex items-center justify-center border border-blue-500/30">
                      <Users className="h-6 w-6 text-blue-400" />
                    </div>
                    <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      Manage
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Manage Doctors
                  </h3>
                  <p className="text-gray-400 text-sm">
                    View and manage existing doctor accounts
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/dashboard/admin/sync-users" className="group">
              <Card className="border border-gray-700/30 shadow-2xl bg-gray-800/50 backdrop-blur-xl hover:bg-gray-800/70 transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-lg flex items-center justify-center border border-orange-500/30">
                      <Database className="h-6 w-6 text-orange-400" />
                    </div>
                    <Badge className="bg-orange-500/20 text-orange-400 border border-orange-500/30">
                      Sync Data
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Sync Users
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Sync users from Clerk to MongoDB database
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/dashboard/admin/analytics" className="group">
              <Card className="border border-gray-700/30 shadow-2xl bg-gray-800/50 backdrop-blur-xl hover:bg-gray-800/70 transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center border border-purple-500/30">
                      <Activity className="h-6 w-6 text-purple-400" />
                    </div>
                    <Badge className="bg-purple-500/20 text-purple-400 border border-purple-500/30">
                      View Reports
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    System Analytics
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Monitor system usage and performance metrics
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Recent Activity */}
          <Card className="border border-gray-700/30 shadow-2xl bg-gray-800/50 backdrop-blur-xl">
            <CardHeader className="border-b border-gray-700/30">
              <CardTitle className="flex items-center space-x-2 text-white">
                <Activity className="h-5 w-5 text-blue-400" />
                <span>Recent System Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {stats.recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No recent activity to display</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b border-gray-700/30 last:border-b-0">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          activity.type === 'prediction' ? 'bg-blue-500' :
                          activity.type === 'doctor_created' ? 'bg-green-500' :
                          'bg-yellow-500'
                        }`}></div>
                        <span className="text-gray-300">{activity.message}</span>
                        {activity.confidence && (
                          <Badge className="bg-gray-700 text-gray-300 text-xs">
                            {activity.confidence.toFixed(1)}% confidence
                          </Badge>
                        )}
                      </div>
                      <span className="text-gray-500 text-sm">{activity.timeAgo}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}