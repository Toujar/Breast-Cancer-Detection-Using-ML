'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

// Real Karnataka doctors data
const karnatakaDoctor = {
  id: 'doc_001',
  name: 'Dr. Rajesh Kumar Sharma',
  specialization: 'Oncologist & Breast Cancer Specialist',
  hospital: 'Kidwai Memorial Institute of Oncology',
  location: 'Bangalore, Karnataka',
  experience: 15,
  qualification: 'MBBS, MD (Oncology), Fellowship in Breast Oncology',
  registrationNumber: 'KMC-45789'
};

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
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'appointment_completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'urgent_request':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'appointment_scheduled':
        return <Calendar className="h-4 w-4 text-blue-600" />;
      case 'report_reviewed':
        return <FileText className="h-4 w-4 text-purple-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
            <p className="text-gray-600">{karnatakaDoctor.name} • {karnatakaDoctor.hospital}</p>
          </div>
          <div className="flex items-center space-x-4">
            <DoctorNotifications />
            <Button>
              <Calendar className="h-4 w-4 mr-2" />
              Schedule
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 max-w-md">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Patients</p>
                      <p className="text-2xl font-bold">{dashboardStats.totalPatients}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-sm text-green-600">+{dashboardStats.weeklyGrowth}% this week</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Pending Requests</p>
                      <p className="text-2xl font-bold">{dashboardStats.pendingRequests}</p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-600" />
                  </div>
                  {dashboardStats.urgentCases > 0 && (
                    <div className="flex items-center mt-2">
                      <AlertTriangle className="h-4 w-4 text-red-600 mr-1" />
                      <span className="text-sm text-red-600">{dashboardStats.urgentCases} urgent</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Today's Appointments</p>
                      <p className="text-2xl font-bold">{dashboardStats.todayAppointments}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="flex items-center mt-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-sm text-green-600">{dashboardStats.completedToday} completed</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">AI Screenings</p>
                      <p className="text-2xl font-bold">24</p>
                    </div>
                    <Activity className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="flex items-center mt-2">
                    <span className="text-sm text-muted-foreground">This week</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {activity.patient}
                          </p>
                          <p className="text-sm text-gray-600">
                            {activity.description}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    View Today's Schedule
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Patient Management
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Reports
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Activity className="h-4 w-4 mr-2" />
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
            <Card>
              <CardHeader>
                <CardTitle>Patient Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Patient management features coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics & Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Analytics dashboard coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}