'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EnhancedNavbar } from '@/components/navbar/EnhancedNavbar';
import {
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  Mail,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  ArrowLeft,
  UserCheck,
  UserX,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  createdAt: string;
  lastSignInAt: string | null;
  role: string;
  status: 'active' | 'inactive';
}

interface DoctorStats {
  totalDoctors: number;
  activeDoctors: number;
  inactiveDoctors: number;
  newThisMonth: number;
}

export default function ManageDoctorsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [stats, setStats] = useState<DoctorStats>({
    totalDoctors: 0,
    activeDoctors: 0,
    inactiveDoctors: 0,
    newThisMonth: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (isLoaded && user) {
      fetchDoctors();
    }
  }, [isLoaded, user]);

  const fetchDoctors = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/doctors');
      
      if (response.ok) {
        const data = await response.json();
        setDoctors(data.doctors);
        setStats(data.stats);
      } else {
        toast.error('Failed to fetch doctors data');
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast.error('Error loading doctors data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchDoctors();
    setIsRefreshing(false);
    toast.success('Data refreshed successfully');
  };

  const handleDeleteDoctor = async (doctorId: string, doctorName: string) => {
    if (!confirm(`Are you sure you want to delete Dr. ${doctorName}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/doctors/${doctorId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success(`Dr. ${doctorName} has been deleted successfully`);
        fetchDoctors(); // Refresh the list
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to delete doctor');
      }
    } catch (error) {
      console.error('Error deleting doctor:', error);
      toast.error('Error deleting doctor');
    }
  };

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = 
      doctor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.emailAddress.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterStatus === 'all' || 
      (filterStatus === 'active' && doctor.lastSignInAt) ||
      (filterStatus === 'inactive' && !doctor.lastSignInAt);

    return matchesSearch && matchesFilter;
  });

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading doctors data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <EnhancedNavbar />

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/dashboard/admin" className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin Dashboard
              </Link>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent mb-2">
                Manage Doctors
              </h1>
              <p className="text-gray-400 text-lg">
                View and manage all doctor accounts in the system
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Link href="/dashboard/admin/create-doctor">
                <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Doctor
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border border-gray-700/30 shadow-2xl bg-gray-800/50 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Doctors</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                    {stats.totalDoctors}
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
                  <p className="text-sm text-gray-400">Active Doctors</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
                    {stats.activeDoctors}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-lg flex items-center justify-center border border-green-500/30">
                  <UserCheck className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-700/30 shadow-2xl bg-gray-800/50 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Inactive Doctors</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                    {stats.inactiveDoctors}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-lg flex items-center justify-center border border-orange-500/30">
                  <UserX className="h-6 w-6 text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-700/30 shadow-2xl bg-gray-800/50 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">New This Month</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {stats.newThisMonth}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center border border-purple-500/30">
                  <Calendar className="h-6 w-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="border border-gray-700/30 shadow-2xl mb-8 bg-gray-800/50 backdrop-blur-xl">
          <CardHeader className="border-b border-gray-700/30">
            <CardTitle className="flex items-center space-x-2 text-white">
              <Filter className="h-5 w-5 text-blue-400" />
              <span>Search & Filter</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Search Doctors</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Filter by Status</Label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                >
                  <option value="all">All Doctors</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Actions</Label>
                <Button
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('all');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Doctors List */}
        <Card className="border border-gray-700/30 shadow-2xl bg-gray-800/50 backdrop-blur-xl">
          <CardHeader className="border-b border-gray-700/30">
            <CardTitle className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-400" />
                <span>Doctors List ({filteredDoctors.length})</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {filteredDoctors.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Doctors Found</h3>
                <p className="text-gray-400 mb-6">
                  {searchTerm || filterStatus !== 'all' 
                    ? 'No doctors match your current filters.' 
                    : 'No doctors have been created yet.'}
                </p>
                <Link href="/dashboard/admin/create-doctor">
                  <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Doctor
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredDoctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700/30 hover:bg-gray-900/70 transition-all"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full flex items-center justify-center border border-blue-500/30">
                        <Users className="h-6 w-6 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">
                          Dr. {doctor.firstName} {doctor.lastName}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <div className="flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {doctor.emailAddress}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            Joined {new Date(doctor.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Badge
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          doctor.lastSignInAt
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                        }`}
                      >
                        {doctor.lastSignInAt ? (
                          <div className="flex items-center">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <XCircle className="h-3 w-3 mr-1" />
                            Never Signed In
                          </div>
                        )}
                      </Badge>
                      
                      <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        <Shield className="h-3 w-3 mr-1" />
                        {doctor.role}
                      </Badge>

                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-600 text-red-400 hover:bg-red-900/20"
                          onClick={() => handleDeleteDoctor(doctor.id, `${doctor.firstName} ${doctor.lastName}`)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}