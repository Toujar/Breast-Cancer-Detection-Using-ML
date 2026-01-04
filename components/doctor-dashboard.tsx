'use client';

import { useState } from 'react';
import { useUser, SignOutButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DoctorPanel } from './doctor-panel';
import { DoctorNotifications } from './doctor-notifications';
import { 
  Calendar, 
  Users, 
  Activity, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  LogOut
} from 'lucide-react';

// Real Karnataka doctors data - will be replaced with Clerk user data
const getKarnatakaDoctor = (user: any) => ({
  id: user.id,
  name: `Dr. ${user.firstName || 'Unknown'} ${user.lastName || 'Doctor'}`,
  specialization: (user.publicMetadata?.specialization as string) || 'Oncologist & Breast Cancer Specialist',
  hospital: (user.publicMetadata?.hospital as string) || 'Kidwai Memorial Institute of Oncology',
  location: (user.publicMetadata?.location as string) || 'Bangalore, Karnataka',
  experience: (user.publicMetadata?.experience as number) || 15,
  qualification: (user.publicMetadata?.qualification as string) || 'MBBS, MD (Oncology), Fellowship in Breast Oncology',
  registrationNumber: (user.publicMetadata?.registrationNumber as string) || 'KMC-45789'
});

// Dashboard statistics
const dashboardStats = {
  totalPatients: 156,
  pendingRequests: 8,
  todayAppointments: 12,
  completedToday: 7,
  urgentCases: 3,
  weeklyGrowth: 15.2
};

// Recent activity data
const recentActivity = [
  {
    id: 1,
    type: 'appointment_completed',
    patient: 'Kavitha Nair',
    time: '2 hours ago',
    description: 'Completed online consultation - Follow-up recommended'
  },
  {
    id: 2,
    type: 'urgent_request',
    patient: 'Priya Sharma',
    time: '3 hours ago',
    description: 'High-risk AI screening - Immediate attention required'
  },
  {
    id: 3,
    type: 'appointment_scheduled',
    patient: 'Anita Reddy',
    time: '5 hours ago',
    description: 'In-person consultation scheduled for tomorrow'
  },
  {
    id: 4,
    type: 'report_reviewed',
    patient: 'Meera Patel',
    time: '1 day ago',
    description: 'AI analysis report reviewed - Normal findings'
  }
];

export function DoctorDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const { user, isLoaded } = useUser();
  const router = useRouter();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading doctor information...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/sign-in');
    return null;
  }

  const karnatakaDoctor = getKarnatakaDoctor(user);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'appointment_completed':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'urgent_request':
        return <AlertTriangle className="h-4 w-4 text-red-400" />;
      case 'appointment_scheduled':
        return <Calendar className="h-4 w-4 text-blue-400" />;
      case 'report_reviewed':
        return <FileText className="h-4 w-4 text-purple-400" />;
      default:
        return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-xl border-b border-gray-700/30 px-3 xs:px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-xl xs:text-2xl sm:text-2xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent">Doctor Dashboard</h1>
            <p className="text-gray-400 text-sm sm:text-base">{karnatakaDoctor.name} • {karnatakaDoctor.hospital}</p>
          </div>
          <div className="flex flex-col xs:flex-row items-stretch xs:items-center space-y-2 xs:space-y-0 xs:space-x-2 sm:space-x-4 w-full xs:w-auto">
            <DoctorNotifications />
            <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 text-sm sm:text-base">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              Schedule
            </Button>
            <SignOutButton>
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white text-sm sm:text-base">
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                Logout
              </Button>
            </SignOutButton>
          </div>
        </div>
      </div>

      <div className="p-3 xs:p-4 sm:p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 max-w-full sm:max-w-md bg-gray-800/50 border border-gray-700/30">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-400 text-gray-400 text-xs sm:text-sm">Overview</TabsTrigger>
            <TabsTrigger value="requests" className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-400 text-gray-400 text-xs sm:text-sm">Requests</TabsTrigger>
            <TabsTrigger value="patients" className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-400 text-gray-400 text-xs sm:text-sm">Patients</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-400 text-gray-400 text-xs sm:text-sm">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              <Card className="border border-gray-700/30 shadow-2xl bg-gray-800/50 backdrop-blur-xl">
                <CardContent className="p-3 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between">
                    <div className="text-center sm:text-left mb-2 sm:mb-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-400">Total Patients</p>
                      <p className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">{dashboardStats.totalPatients}</p>
                    </div>
                    <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-lg flex items-center justify-center border border-blue-500/30">
                      <Users className="h-4 w-4 sm:h-6 sm:w-6 text-blue-400" />
                    </div>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start mt-2">
                    <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-400 mr-1" />
                    <span className="text-xs sm:text-sm text-green-400">+{dashboardStats.weeklyGrowth}% this week</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-700/30 shadow-2xl bg-gray-800/50 backdrop-blur-xl">
                <CardContent className="p-3 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between">
                    <div className="text-center sm:text-left mb-2 sm:mb-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-400">Pending Requests</p>
                      <p className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">{dashboardStats.pendingRequests}</p>
                    </div>
                    <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg flex items-center justify-center border border-yellow-500/30">
                      <Clock className="h-4 w-4 sm:h-6 sm:w-6 text-yellow-400" />
                    </div>
                  </div>
                  {dashboardStats.urgentCases > 0 && (
                    <div className="flex items-center justify-center sm:justify-start mt-2">
                      <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-red-400 mr-1" />
                      <span className="text-xs sm:text-sm text-red-400">{dashboardStats.urgentCases} urgent</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border border-gray-700/30 shadow-2xl bg-gray-800/50 backdrop-blur-xl">
                <CardContent className="p-3 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between">
                    <div className="text-center sm:text-left mb-2 sm:mb-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-400">Today's Appointments</p>
                      <p className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">{dashboardStats.todayAppointments}</p>
                    </div>
                    <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-lg flex items-center justify-center border border-green-500/30">
                      <Calendar className="h-4 w-4 sm:h-6 sm:w-6 text-green-400" />
                    </div>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start mt-2">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-400 mr-1" />
                    <span className="text-xs sm:text-sm text-green-400">{dashboardStats.completedToday} completed</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-700/30 shadow-2xl bg-gray-800/50 backdrop-blur-xl">
                <CardContent className="p-3 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between">
                    <div className="text-center sm:text-left mb-2 sm:mb-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-400">AI Screenings</p>
                      <p className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">24</p>
                    </div>
                    <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center border border-purple-500/30">
                      <Activity className="h-4 w-4 sm:h-6 sm:w-6 text-purple-400" />
                    </div>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start mt-2">
                    <span className="text-xs sm:text-sm text-gray-400">This week</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card className="border border-gray-700/30 shadow-2xl bg-gray-800/50 backdrop-blur-xl">
                <CardHeader className="border-b border-gray-700/30 p-4 sm:p-6">
                  <CardTitle className="text-white text-base sm:text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
                  <div className="space-y-3 sm:space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg bg-gray-900/50 hover:bg-gray-900/70 transition-colors">
                        <div className="flex-shrink-0 mt-1">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-white">
                            {activity.patient}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-400">
                            {activity.description}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-700/30 shadow-2xl bg-gray-800/50 backdrop-blur-xl">
                <CardHeader className="border-b border-gray-700/30 p-4 sm:p-6">
                  <CardTitle className="text-white text-base sm:text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 sm:space-y-3 pt-4 sm:pt-6 p-4 sm:p-6">
                  <Button className="w-full justify-start bg-gray-700/50 hover:bg-gray-700 text-white border border-gray-600 text-sm sm:text-base">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    View Today's Schedule
                  </Button>
                  <Button className="w-full justify-start bg-gray-700/50 hover:bg-gray-700 text-white border border-gray-600 text-sm sm:text-base">
                    <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    Patient Management
                  </Button>
                  <Button className="w-full justify-start bg-gray-700/50 hover:bg-gray-700 text-white border border-gray-600 text-sm sm:text-base">
                    <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    Generate Reports
                  </Button>
                  <Button className="w-full justify-start bg-gray-700/50 hover:bg-gray-700 text-white border border-gray-600 text-sm sm:text-base">
                    <Activity className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    AI Analytics Dashboard
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="requests">
            <DoctorPanel />
          </TabsContent>

          <TabsContent value="patients">
            <Card className="border border-gray-700/30 shadow-2xl bg-gray-800/50 backdrop-blur-xl">
              <CardHeader className="border-b border-gray-700/30 p-4 sm:p-6">
                <CardTitle className="text-white text-base sm:text-lg">Patient Management</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
                <p className="text-gray-400 text-sm sm:text-base">Patient management features coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="border border-gray-700/30 shadow-2xl bg-gray-800/50 backdrop-blur-xl">
              <CardHeader className="border-b border-gray-700/30 p-4 sm:p-6">
                <CardTitle className="text-white text-base sm:text-lg">Analytics & Reports</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
                <p className="text-gray-400 text-sm sm:text-base">Analytics dashboard coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}