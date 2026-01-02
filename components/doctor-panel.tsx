'use client';

import { useState, useEffect } from 'react';
import { useUser, SignOutButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  User, 
  Phone, 
  Calendar, 
  MapPin, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  FileText,
  Activity,
  Users,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppointmentRequest {
  _id: string;
  patientName: string;
  patientAge: number;
  patientContact: string;
  patientLocation?: string;
  createdAt: string;
  consultationMode: 'online' | 'in-person';
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  aiResult: {
    riskLevel: 'Low' | 'Medium' | 'High';
    confidence: number;
    summary: string;
    imageAnalysis: string;
  };
  urgency?: 'low' | 'medium' | 'high';
  preferredDate?: string;
  symptoms?: string;
  patientId?: {
    username: string;
    email: string;
  };
}

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  hospital: string;
  location: string;
  experience: number;
  qualification?: string;
  registrationNumber: string;
  avatar?: string;
  email?: string;
  phoneNumber?: string;
}

export function DoctorPanel() {
  const [requests, setRequests] = useState<AppointmentRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<AppointmentRequest | null>(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [isLoading, setIsLoading] = useState(true);
  const [currentDoctor, setCurrentDoctor] = useState<Doctor | null>(null);
  const [doctorLoading, setDoctorLoading] = useState(true);
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const handleLogout = () => {
    router.push('/');
  };

  useEffect(() => {
    if (isLoaded && user) {
      fetchCurrentDoctor();
      fetchAppointmentRequests();
    }
  }, [isLoaded, user]);

  const fetchCurrentDoctor = async () => {
    setDoctorLoading(true);
    try {
      if (user) {
        const userRole = (user.publicMetadata?.role as string) || 'user';
        if (userRole === 'doctor') {
          // Try to fetch doctor details from MongoDB first
          try {
            const response = await fetch('/api/doctors', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ clerkId: user.id }),
            });

            if (response.ok) {
              const data = await response.json();
              if (data.success && data.doctor) {
                const doctor = data.doctor;
                setCurrentDoctor({
                  id: doctor.id,
                  name: doctor.fullName,
                  specialization: doctor.specialization,
                  hospital: doctor.hospital,
                  location: doctor.location,
                  experience: doctor.experience,
                  registrationNumber: doctor.licenseNumber,
                  email: doctor.email,
                  phoneNumber: doctor.phoneNumber,
                  avatar: doctor.profileImage
                });
                return;
              }
            }
          } catch (error) {
            console.log('Could not fetch doctor from database, using Clerk data');
          }

          // Fallback to Clerk metadata if database fetch fails
          setCurrentDoctor({
            id: user.id,
            name: `Dr. ${user.firstName || 'Unknown'} ${user.lastName || 'Doctor'}`,
            specialization: (user.publicMetadata?.specialization as string) || 'General Practitioner',
            hospital: (user.publicMetadata?.hospital as string) || 'Private Practice',
            location: (user.publicMetadata?.location as string) || 'Location not specified',
            experience: (user.publicMetadata?.experience as number) || 0,
            registrationNumber: (user.publicMetadata?.registrationNumber as string) || 'N/A',
            email: user.emailAddresses[0]?.emailAddress || '',
            phoneNumber: (user.publicMetadata?.phoneNumber as string) || ''
          });
        }
      }
    } catch (error) {
      console.error('Error fetching current doctor:', error);
    } finally {
      setDoctorLoading(false);
    }
  };

  const fetchAppointmentRequests = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/appointments/doctor');
      if (response.ok) {
        const data = await response.json();
        // Transform the data to match our interface
        const transformedRequests = data.requests.map((req: any) => ({
          ...req,
          id: req._id,
          patientLocation: req.patientLocation || 'Location not provided',
          requestDate: new Date(req.createdAt),
          urgency: getUrgencyFromRisk(req.aiResult?.riskLevel)
        }));
        setRequests(transformedRequests);
      } else {
        console.error('Failed to fetch appointment requests');
        setRequests([]);
      }
    } catch (error) {
      console.error('Error fetching appointment requests:', error);
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getUrgencyFromRisk = (riskLevel: string): 'low' | 'medium' | 'high' => {
    switch (riskLevel) {
      case 'High': return 'high';
      case 'Medium': return 'medium';
      case 'Low': return 'low';
      default: return 'medium';
    }
  };

  const handleRequestAction = async (requestId: string, action: 'accept' | 'reject') => {
    try {
      const response = await fetch('/api/appointments/doctor', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId,
          action: action === 'accept' ? 'accepted' : 'rejected',
          doctorNotes: action === 'accept' ? 'Appointment accepted' : undefined,
          rejectionReason: action === 'reject' ? 'Schedule conflict' : undefined,
        }),
      });

      if (response.ok) {
        // Update local state
        setRequests(prev => prev.map(req => 
          req._id === requestId 
            ? { ...req, status: action === 'accept' ? 'accepted' : 'rejected' }
            : req
        ));
      } else {
        alert('Failed to update appointment request');
      }
    } catch (error) {
      console.error('Error updating appointment request:', error);
      alert('Failed to update appointment request');
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High': return 'text-red-400 bg-red-500/10 border border-red-500/30';
      case 'Medium': return 'text-yellow-400 bg-yellow-500/10 border border-yellow-500/30';
      case 'Low': return 'text-green-400 bg-green-500/10 border border-green-500/30';
      default: return 'text-gray-400 bg-gray-500/10 border border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-400" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-blue-400" />;
      default: return <Clock className="h-4 w-4 text-yellow-400" />;
    }
  };

  const filteredRequests = requests.filter(req => {
    if (activeTab === 'pending') return req.status === 'pending';
    if (activeTab === 'accepted') return req.status === 'accepted';
    if (activeTab === 'completed') return req.status === 'completed';
    return true;
  });

  const pendingCount = requests.filter(req => req.status === 'pending').length;
  const todayCount = requests.filter(req => {
    const today = new Date().toDateString();
    return new Date(req.createdAt).toDateString() === today;
  }).length;

  if (!isLoaded || doctorLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading doctor information...</p>
        </div>
      </div>
    );
  }

  if (!user || !currentDoctor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-400" />
          <h2 className="text-xl font-semibold mb-2 text-white">Access Denied</h2>
          <p className="text-gray-400">You need to be logged in as a doctor to access this panel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Doctor Header */}
        <Card className="border border-gray-700/30 shadow-2xl bg-gray-800/50 backdrop-blur-xl">
          <CardHeader className="border-b border-gray-700/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16 ring-2 ring-blue-500/30">
                  <AvatarImage src={currentDoctor.avatar} />
                  <AvatarFallback className="text-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 text-blue-400">
                    {currentDoctor.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold text-white">{currentDoctor.name}</h1>
                  <p className="text-gray-400">{currentDoctor.specialization}</p>
                  <p className="text-sm text-gray-500">
                    {currentDoctor.hospital} • {currentDoctor.location}
                  </p>
                  <p className="text-xs text-gray-500">
                    {currentDoctor.experience} years experience • Reg: {currentDoctor.registrationNumber}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">{pendingCount}</div>
                  <div className="text-sm text-gray-400">Pending</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">{todayCount}</div>
                  <div className="text-sm text-gray-400">Today</div>
                </div>
                <Button size="sm" className="relative bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                  {pendingCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs bg-red-500">
                      {pendingCount}
                    </Badge>
                  )}
                </Button>
                <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white">
                  <SignOutButton>
                    <div className="flex items-center">
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </div>
                  </SignOutButton>
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Requests List */}
          <div className="lg:col-span-2">
            <Card className="border border-gray-700/30 shadow-2xl bg-gray-800/50 backdrop-blur-xl">
              <CardHeader className="border-b border-gray-700/30">
                <CardTitle className="flex items-center gap-2 text-white">
                  <Users className="h-5 w-5 text-blue-400" />
                  Appointment Requests
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-4 bg-gray-700/50 border border-gray-600/30">
                    <TabsTrigger value="pending" className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-400 text-gray-400">
                      Pending ({requests.filter(r => r.status === 'pending').length})
                    </TabsTrigger>
                    <TabsTrigger value="accepted" className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-400 text-gray-400">
                      Accepted ({requests.filter(r => r.status === 'accepted').length})
                    </TabsTrigger>
                    <TabsTrigger value="completed" className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-400 text-gray-400">
                      Completed ({requests.filter(r => r.status === 'completed').length})
                    </TabsTrigger>
                    <TabsTrigger value="all" className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-400 text-gray-400">All</TabsTrigger>
                  </TabsList>

                  <TabsContent value={activeTab} className="mt-4">
                    <ScrollArea className="h-[600px]">
                      <div className="space-y-4">
                        {isLoading ? (
                          <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                            <p className="text-gray-400">Loading appointment requests...</p>
                          </div>
                        ) : filteredRequests.length === 0 ? (
                          <div className="text-center py-8">
                            <p className="text-gray-400">No {activeTab} requests found</p>
                          </div>
                        ) : (
                          filteredRequests.map((request) => (
                          <Card 
                            key={request._id} 
                            className={cn(
                              "cursor-pointer transition-all hover:shadow-md bg-gray-900/50 border-gray-700/30 hover:bg-gray-900/70",
                              selectedRequest?._id === request._id && "ring-2 ring-blue-500"
                            )}
                            onClick={() => setSelectedRequest(request)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                  <Avatar className="ring-2 ring-gray-600">
                                    <AvatarFallback className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 text-blue-400">
                                      {request.patientName.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <h3 className="font-semibold text-white">{request.patientName}</h3>
                                    <p className="text-sm text-gray-400">
                                      Age: {request.patientAge} • {request.patientLocation}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {getStatusIcon(request.status)}
                                  <Badge className={getUrgencyColor(request.urgency || 'medium')}>
                                    {request.urgency || 'medium'}
                                  </Badge>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4 mb-3">
                                <div className="flex items-center space-x-2 text-sm">
                                  <Calendar className="h-4 w-4 text-gray-400" />
                                  <span className="text-gray-300">{new Date(request.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm">
                                  <Activity className="h-4 w-4 text-gray-400" />
                                  <span className="text-gray-300 capitalize">{request.consultationMode}</span>
                                </div>
                              </div>

                              <div className={cn(
                                "p-3 rounded-lg mb-3",
                                getRiskColor(request.aiResult.riskLevel)
                              )}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium">AI Risk Assessment</span>
                                  <Badge variant="outline" className="border-gray-600 text-gray-300">
                                    {request.aiResult.confidence}% confidence
                                  </Badge>
                                </div>
                                <div className="text-sm">
                                  <strong>Risk Level:</strong> {request.aiResult.riskLevel}
                                </div>
                                <div className="text-sm mt-1">
                                  {request.aiResult.summary}
                                </div>
                              </div>

                              {request.status === 'pending' && (
                                <div className="flex space-x-2">
                                  <Button 
                                    size="sm" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRequestAction(request._id, 'accept');
                                    }}
                                    className="flex-1 bg-gradient-to-r from-green-500 to-teal-600 text-white hover:from-green-600 hover:to-teal-700"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Accept
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRequestAction(request._id, 'reject');
                                    }}
                                    className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Decline
                                  </Button>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Request Details */}
          <div>
            <Card className="border border-gray-700/30 shadow-2xl bg-gray-800/50 backdrop-blur-xl">
              <CardHeader className="border-b border-gray-700/30">
                <CardTitle className="flex items-center gap-2 text-white">
                  <FileText className="h-5 w-5 text-blue-400" />
                  Request Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {selectedRequest ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg text-white">{selectedRequest.patientName}</h3>
                      <p className="text-gray-400">Patient Information</p>
                    </div>

                    <Separator className="bg-gray-700/50" />

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-300">Age: {selectedRequest.patientAge} years</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-300">{selectedRequest.patientContact}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-300">{selectedRequest.patientLocation}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-300">
                          Requested: {new Date(selectedRequest.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {selectedRequest.preferredDate && (
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-300">
                            Preferred: {selectedRequest.preferredDate}
                          </span>
                        </div>
                      )}
                    </div>

                    <Separator className="bg-gray-700/50" />

                    <div>
                      <h4 className="font-medium mb-2 text-white">AI Analysis Report</h4>
                      <div className={cn(
                        "p-3 rounded-lg space-y-2",
                        getRiskColor(selectedRequest.aiResult.riskLevel)
                      )}>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Risk Level</span>
                          <Badge className="bg-gray-700/50 text-gray-300 border-gray-600">{selectedRequest.aiResult.riskLevel}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Confidence</span>
                          <span>{selectedRequest.aiResult.confidence}%</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1">Summary:</p>
                          <p className="text-sm">{selectedRequest.aiResult.summary}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1">Image Analysis:</p>
                          <p className="text-sm">{selectedRequest.aiResult.imageAnalysis}</p>
                        </div>
                      </div>
                    </div>

                    {selectedRequest.symptoms && (
                      <>
                        <Separator className="bg-gray-700/50" />
                        <div>
                          <h4 className="font-medium mb-2 text-white">Patient Symptoms</h4>
                          <p className="text-sm text-gray-400">
                            {selectedRequest.symptoms}
                          </p>
                        </div>
                      </>
                    )}

                    <Separator className="bg-gray-700/50" />

                    <div>
                      <h4 className="font-medium mb-2 text-white">Consultation Mode</h4>
                      <Badge variant="outline" className="capitalize border-gray-600 text-gray-300">
                        {selectedRequest.consultationMode}
                      </Badge>
                    </div>

                    {selectedRequest.status === 'pending' && (
                      <>
                        <Separator className="bg-gray-700/50" />
                        <div className="space-y-2">
                          <Button 
                            onClick={() => handleRequestAction(selectedRequest._id, 'accept')}
                            className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white hover:from-green-600 hover:to-teal-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Accept Appointment
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => handleRequestAction(selectedRequest._id, 'reject')}
                            className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Decline Request
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select a request to view details</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}