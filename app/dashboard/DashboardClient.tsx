'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, SignOutButton } from '@clerk/nextjs';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { UserRoleBadge } from '@/components/auth/user-role-badge';
import { EnhancedNavbar } from '@/components/navbar/EnhancedNavbar';
import {
  Brain,
  FileText,
  Activity,
  Users,
  BarChart3,
  Upload,
  History,
  Settings,
  LogOut,
  Heart,
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react';
import { UserNotifications } from '@/components/user-notifications';

interface DashboardStats {
  totalPredictions: number;
  recentPredictions: number;
  accuracy: number;
  lastActive: string;
}

interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
}

interface RecentPrediction {
  id: string;
  type: 'tabular' | 'image';
  result: 'benign' | 'malignant';
  confidence: number;
  date: string;
}

export default function DashboardClient() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalPredictions: 0,
    recentPredictions: 0,
    accuracy: 94.6, // Real model accuracy from test results
    lastActive: 'Today'
  });
  const [modelMetrics, setModelMetrics] = useState<ModelMetrics>({
    accuracy: 94.6, // Real accuracy: 94.62%
    precision: 95.0, // Weighted average precision: 95%
    recall: 95.0,    // Weighted average recall: 95%
    f1Score: 95.0    // Weighted average F1-score: 95%
  });
  const [recentPredictions, setRecentPredictions] = useState<RecentPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && user) {
      fetchDashboardData();
    } else if (isLoaded && !user) {
      router.push('/sign-in');
    }
  }, [isLoaded, user, router]);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, predictionsResponse, metricsResponse] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/predictions/recent'),
        fetch('/api/dashboard/metrics')
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
      if (predictionsResponse.ok) {
        const predictionsData = await predictionsResponse.json();
        setRecentPredictions(predictionsData);
      }
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setModelMetrics(metricsData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  
  const handleLogout = () => {
    // Clerk handles logout automatically with SignOutButton
    router.push('/');
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Authentication Required</h2>
          <p className="text-gray-400 mb-4">Please sign in to access your dashboard.</p>
          <Button onClick={() => router.push('/sign-in')} className="bg-blue-600 hover:bg-blue-700">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  const userRole = (user.publicMetadata?.role as string) || 'user';
  const userName = user.firstName || user.emailAddresses[0]?.emailAddress?.split('@')[0] || 'User';
  const userEmail = user.emailAddresses[0]?.emailAddress || '';

 

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-pink-500/8 to-rose-500/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-40 right-1/3 w-64 h-64 bg-gradient-to-r from-amber-500/8 to-orange-500/8 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Geometric Patterns */}
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-2 h-2 bg-blue-400/20 rounded-full animate-ping"></div>
        </div>
        <div className="absolute top-3/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-1 h-1 bg-purple-400/25 rounded-full animate-ping delay-700"></div>
        </div>
        <div className="absolute top-1/2 right-1/4 transform translate-x-1/2 -translate-y-1/2">
          <div className="w-3 h-3 bg-pink-400/15 rounded-full animate-ping delay-1500"></div>
        </div>
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-gray-800/5 to-transparent"></div>
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(156, 163, 175, 0.2) 1px, transparent 0)`,
            backgroundSize: '50px 50px'
          }}
        ></div>
      </div>

      {/* Enhanced Navigation with Clerk Integration */}
      <EnhancedNavbar />

      <div className="max-w-7xl mx-auto p-3 xs:p-4 sm:p-6 relative z-10">
        {/* Header - Enhanced with Gradient Text */}
        <div className="mb-6 sm:mb-10">
          <h1 className="text-2xl xs:text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent mb-2 tracking-tight">
            Welcome back, {userName}
          </h1>
          <p className="text-gray-400 text-sm sm:text-lg font-light">
            Monitor your AI-assisted breast cancer detection activities and insights.
          </p>
        </div>

        {/* Quick Stats - Enhanced Glass Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-10">
          <Card className="border border-gray-700/30 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 rounded-xl sm:rounded-2xl bg-black/40 backdrop-blur-xl hover:bg-black/50 transform hover:-translate-y-1">
            <CardContent className="p-3 sm:p-6 flex flex-col sm:flex-row justify-between items-center">
              <div className="text-center sm:text-left mb-2 sm:mb-0">
                <p className="text-xs sm:text-sm text-gray-400 font-light mb-1">Total Predictions</p>
                <p className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">{stats.totalPredictions}</p>
              </div>
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 border border-blue-500/20">
                <Brain className="h-4 w-4 sm:h-6 sm:w-6 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-700/30 hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-500 rounded-xl sm:rounded-2xl bg-black/40 backdrop-blur-xl hover:bg-black/50 transform hover:-translate-y-1">
            <CardContent className="p-3 sm:p-6 flex flex-col sm:flex-row justify-between items-center">
              <div className="text-center sm:text-left mb-2 sm:mb-0">
                <p className="text-xs sm:text-sm text-gray-400 font-light mb-1">This Week</p>
                <p className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">{stats.recentPredictions}</p>
              </div>
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20 border border-green-500/20">
                <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-700/30 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 rounded-xl sm:rounded-2xl bg-black/40 backdrop-blur-xl hover:bg-black/50 transform hover:-translate-y-1">
            <CardContent className="p-3 sm:p-6 flex flex-col sm:flex-row justify-between items-center">
              <div className="text-center sm:text-left mb-2 sm:mb-0">
                <p className="text-xs sm:text-sm text-gray-400 font-light mb-1">Model Accuracy</p>
                <p className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{stats.accuracy}%</p>
              </div>
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 border border-purple-500/20">
                <BarChart3 className="h-4 w-4 sm:h-6 sm:w-6 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-700/30 hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-500 rounded-xl sm:rounded-2xl bg-black/40 backdrop-blur-xl hover:bg-black/50 transform hover:-translate-y-1">
            <CardContent className="p-3 sm:p-6 flex flex-col sm:flex-row justify-between items-center">
              <div className="text-center sm:text-left mb-2 sm:mb-0">
                <p className="text-xs sm:text-sm text-gray-400 font-light mb-1">Last Active</p>
                <p className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">{stats.lastActive}</p>
              </div>
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 border border-orange-500/20">
                <Clock className="h-4 w-4 sm:h-6 sm:w-6 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>


        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Quick Actions + Recent Predictions */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Quick Actions */}
            <Card className="border border-gray-700/30 shadow-2xl hover:shadow-3xl transition-all duration-500 rounded-xl sm:rounded-2xl bg-black/50 backdrop-blur-xl hover:bg-black/60 transform hover:-translate-y-2">
              <CardHeader className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-t-xl sm:rounded-t-2xl border-b border-gray-600/30 p-4 sm:p-6">
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-400" />
                  <span className="text-base sm:text-lg font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Quick Actions</span>
                </CardTitle>
                <CardDescription className="text-gray-400 text-sm sm:text-base">
                  Start a new analysis or view your previous results
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <Link href="/predict/tabular">
                    <Card className="cursor-pointer transform hover:scale-105 transition-all duration-300 border-2 border-gray-700/30 hover:border-indigo-500/50 bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-xl shadow-lg hover:shadow-xl backdrop-blur-sm">
                      <CardContent className="p-4 sm:p-6 text-center">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-500/20 to-blue-600/20 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300 border border-indigo-500/20">
                          <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-400" />
                        </div>
                        <h3 className="font-bold text-white mb-2 text-sm sm:text-lg">Data Analysis</h3>
                        <p className="text-xs sm:text-sm text-gray-400">
                          Input patient parameters for AI prediction
                        </p>
                      </CardContent>
                    </Card>
                  </Link>

                  <Link href="/predict/image">
                    <Card className="cursor-pointer transform hover:scale-105 transition-all duration-300 border-2 border-gray-700/30 hover:border-green-500/50 bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-xl shadow-lg hover:shadow-xl backdrop-blur-sm">
                      <CardContent className="p-4 sm:p-6 text-center">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 transition-all duration-300 border border-green-500/20">
                          <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-green-400" />
                        </div>
                        <h3 className="font-bold text-white mb-2 text-sm sm:text-lg">Image Analysis</h3>
                        <p className="text-xs sm:text-sm text-gray-400">
                          Upload ultrasound for AI detection
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Recent Predictions */}
            <Card className="border border-gray-700/30 shadow-2xl hover:shadow-3xl transition-all duration-500 rounded-xl sm:rounded-2xl bg-black/50 backdrop-blur-xl hover:bg-black/60">
              <CardHeader className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-t-xl sm:rounded-t-2xl border-b border-gray-600/30 p-4 sm:p-6">
                <CardTitle className="flex items-center space-x-2">
                  <History className="h-4 w-4 sm:h-5 sm:w-5 text-pink-400" />
                  <span className="text-base sm:text-lg font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Recent Predictions</span>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-gray-400">
                  Your latest AI analysis results
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {recentPredictions.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {recentPredictions.map((prediction) => (
                      <Link key={prediction.id} href={`/results/${prediction.id}`}>
                        <div
                          className={`flex items-center justify-between p-3 sm:p-4 rounded-xl shadow-lg transition-all duration-300 backdrop-blur-sm border border-gray-700/30 hover:shadow-xl transform hover:-translate-y-1 cursor-pointer
                ${prediction.result === 'benign' ? 'bg-gradient-to-r from-green-900/30 to-emerald-900/30 hover:from-green-800/40 hover:to-emerald-800/40' : 'bg-gradient-to-r from-red-900/30 to-rose-900/30 hover:from-red-800/40 hover:to-rose-800/40'}`}
                        >
                          <div className="flex items-center space-x-3 sm:space-x-4">
                            <div
                              className={`w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 border
                    ${prediction.result === 'benign' ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 shadow-green-500/25 border-green-500/30' : 'bg-gradient-to-br from-red-500/20 to-rose-500/20 shadow-red-500/25 border-red-500/30'}`}
                            >
                              {prediction.type === 'tabular' ? (
                                <FileText className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                              ) : (
                                <Upload className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-white capitalize text-sm sm:text-base">
                                {prediction.result} ({prediction.confidence}% confidence)
                              </p>
                              <p className="text-xs sm:text-sm text-gray-400">{prediction.date}</p>
                            </div>
                          </div>
                          <Badge
                            className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium shadow-md ${prediction.result === 'benign' ? 'bg-gradient-to-r from-green-900/50 to-emerald-900/50 text-green-300 border-green-600/30' : 'bg-gradient-to-r from-red-900/50 to-rose-900/50 text-red-300 border-red-600/30'}`}
                          >
                            {prediction.type}
                          </Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-700/50 to-gray-600/50 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg border border-gray-600/30">
                      <FileText className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">Be the first to predict!</h3>
                    <p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">Kickstart your journey with a quick analysis below.</p>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                      <Link href="/predict/tabular">
                        <Button className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-blue-600 text-white hover:from-indigo-600 hover:to-blue-700 transition-all duration-300 rounded-xl px-4 sm:px-6 py-2 sm:py-3 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transform hover:-translate-y-1 text-sm sm:text-base">
                          <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                          Start Data Analysis
                        </Button>
                      </Link>
                      <Link href="/predict/image">
                        <Button className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transition-all duration-300 rounded-xl px-4 sm:px-6 py-2 sm:py-3 shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 transform hover:-translate-y-1 text-sm sm:text-base">
                          <Upload className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                          Start Image Analysis
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            
          </div>


          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Model Performance */}
            <Card className="border border-gray-700/30 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl sm:rounded-2xl bg-black/50 backdrop-blur-xl">
              <CardHeader className="border-b border-gray-600/30 p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg font-semibold text-white">Model Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-5 p-4 sm:p-6">
                {[
                  { label: 'Accuracy', value: modelMetrics.accuracy, gradient: 'from-blue-400 to-blue-600' },
                  { label: 'Precision', value: modelMetrics.precision, gradient: 'from-purple-400 to-purple-600' },
                  { label: 'Recall', value: modelMetrics.recall, gradient: 'from-teal-400 to-teal-600' },
                  { label: 'F1-Score', value: modelMetrics.f1Score, gradient: 'from-pink-400 to-pink-600' },
                ].map((metric) => (
                  <div key={metric.label} className="space-y-1">
                    <div className="flex justify-between text-xs sm:text-sm font-medium text-gray-300">
                      <span>{metric.label}</span>
                      <span>{metric.value}%</span>
                    </div>
                    <div className="w-full h-2 sm:h-3 bg-gray-700/50 rounded-full overflow-hidden">
                      <div
                        className={`h-2 sm:h-3 rounded-full bg-gradient-to-r ${metric.gradient} transition-all duration-500`}
                        style={{ width: `${metric.value}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Access */}
            <Card className="border border-gray-700/30 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl sm:rounded-2xl bg-black/50 backdrop-blur-xl">
              <CardHeader className="border-b border-gray-600/30 p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg font-semibold text-white">Quick Access</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3 p-4 sm:p-6">
                <Link href="/history">
                  <Button
                    variant="ghost"
                    className="w-full justify-start rounded-lg px-3 sm:px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all duration-300 text-sm sm:text-base"
                  >
                    <History className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 text-indigo-400" />
                    View History
                  </Button>
                </Link>
                <Link href="/analytics">
                  <Button
                    variant="ghost"
                    className="w-full justify-start rounded-lg px-3 sm:px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all duration-300 text-sm sm:text-base"
                  >
                    <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 text-green-400" />
                    Analytics
                  </Button>
                </Link>
                {user && userRole === 'admin' && (
                  <Link href="/dashboard/admin">
                    <Button
                      variant="ghost"
                      className="w-full justify-start rounded-lg px-3 sm:px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all duration-300 text-sm sm:text-base"
                    >
                      <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 text-pink-400" />
                      Admin Panel
                    </Button>
                  </Link>
                )}
                <Link href="/settings">
                  <Button
                    variant="ghost"
                    className="w-full justify-start rounded-lg px-3 sm:px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all duration-300 text-sm sm:text-base"
                  >
                    <Settings className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 text-gray-400" />
                    Settings
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card className="border border-gray-700/30 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl sm:rounded-2xl bg-black/50 backdrop-blur-xl">
              <CardHeader className="border-b border-gray-600/30 p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg font-semibold text-white">System Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                {[
                  { label: 'AI Model', status: 'Active', iconColor: 'text-green-400', bgColor: 'bg-green-900/30', gradient: 'bg-gradient-to-r from-green-900/30 to-green-800/30' },
                  { label: 'API Status', status: 'Online', iconColor: 'text-blue-400', bgColor: 'bg-blue-900/30', gradient: 'bg-gradient-to-r from-blue-900/30 to-blue-800/30' },
                  { label: 'Database', status: 'Connected', iconColor: 'text-purple-400', bgColor: 'bg-purple-900/30', gradient: 'bg-gradient-to-r from-purple-900/30 to-purple-800/30' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`flex items-center justify-between p-2 sm:p-3 rounded-xl ${item.gradient} shadow-sm hover:scale-105 transition-transform duration-300 border border-gray-600/20`}
                  >
                    <span className="text-xs sm:text-sm font-medium text-gray-300">{item.label}</span>
                    <Badge
                      className={`flex items-center px-2 sm:px-3 py-1 rounded-full font-medium text-xs sm:text-sm ${item.bgColor} ${item.iconColor} shadow-md border border-gray-600/30`}
                    >
                      <CheckCircle className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 ${item.iconColor}`} />
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
}
