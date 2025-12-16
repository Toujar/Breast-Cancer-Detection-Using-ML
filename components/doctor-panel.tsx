'use client';

import { useState, useEffect } from 'react';
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
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    fetchCurrentDoctor();
    fetchAppointmentRequests();
  }, []);

  const fetchCurrentDoctor = async () => {
    setDoctorLoading(true);
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        const user = data.user;
        if (user && user.role === 'doctor') {
          setCurrentDoctor({
            id: user.id,
            name: user.username,
            specialization: user.specialization || 'General Practitioner',
            hospital: user.hospital || 'Private Practice',
            location: user.location,
            experience: user.experience || 0,
            registrationNumber: user.registrationNumber || 'N/A',
            email: user.email,
            phoneNumber: user.phoneNumber
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
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High': return 'text-red-600 bg-red-50';
      case 'Medium': return 'text-yellow-600 bg-yellow-50';
      case 'Low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default: return <Clock className="h-4 w-4 text-yellow-600" />;
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

  if (doctorLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading doctor information...</p>
        </div>
      </div>
    );
  }

  if (!currentDoctor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-gray-600">You need to be logged in as a doctor to access this panel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Doctor Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={currentDoctor.avatar} />
                  <AvatarFallback className="text-lg">
                    {currentDoctor.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold">{currentDoctor.name}</h1>
                  <p className="text-muted-foreground">{currentDoctor.specialization}</p>
                  <p className="text-sm text-muted-foreground">
                    {currentDoctor.hospital} • {currentDoctor.location}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {currentDoctor.experience} years experience • Reg: {currentDoctor.registrationNumber}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{pendingCount}</div>
                  <div className="text-sm text-muted-foreground">Pending</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{todayCount}</div>
                  <div className="text-sm text-muted-foreground">Today</div>
                </div>
                <Button size="sm" className="relative">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                  {pendingCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">
                      {pendingCount}
                    </Badge>
                  )}
                </Button>
                <Button size="sm" variant="outline" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Requests List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Appointment Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="pending">
                      Pending ({requests.filter(r => r.status === 'pending').length})
                    </TabsTrigger>
                    <TabsTrigger value="accepted">
                      Accepted ({requests.filter(r => r.status === 'accepted').length})
                    </TabsTrigger>
                    <TabsTrigger value="completed">
                      Completed ({requests.filter(r => r.status === 'completed').length})
                    </TabsTrigger>
                    <TabsTrigger value="all">All</TabsTrigger>
                  </TabsList>

                  <TabsContent value={activeTab} className="mt-4">
                    <ScrollArea className="h-[600px]">
                      <div className="space-y-4">
                        {isLoading ? (
                          <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading appointment requests...</p>
                          </div>
                        ) : filteredRequests.length === 0 ? (
                          <div className="text-center py-8">
                            <p className="text-gray-600">No {activeTab} requests found</p>
                          </div>
                        ) : (
                          filteredRequests.map((request) => (
                          <Card 
                            key={request._id} 
                            className={cn(
                              "cursor-pointer transition-all hover:shadow-md",
                              selectedRequest?._id === request._id && "ring-2 ring-blue-500"
                            )}
                            onClick={() => setSelectedRequest(request)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                  <Avatar>
                                    <AvatarFallback>
                                      {request.patientName.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <h3 className="font-semibold">{request.patientName}</h3>
                                    <p className="text-sm text-muted-foreground">
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
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm">
                                  <Activity className="h-4 w-4 text-muted-foreground" />
                                  <span>{request.consultationMode}</span>
                                </div>
                              </div>

                              <div className={cn(
                                "p-3 rounded-lg mb-3",
                                getRiskColor(request.aiResult.riskLevel)
                              )}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium">AI Risk Assessment</span>
                                  <Badge variant="outline">
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
                                    className="flex-1"
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
                                    className="flex-1"
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Request Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedRequest ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg">{selectedRequest.patientName}</h3>
                      <p className="text-muted-foreground">Patient Information</p>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Age: {selectedRequest.patientAge} years</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{selectedRequest.patientContact}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{selectedRequest.patientLocation}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Requested: {new Date(selectedRequest.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {selectedRequest.preferredDate && (
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            Preferred: {selectedRequest.preferredDate}
                          </span>
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-2">AI Analysis Report</h4>
                      <div className={cn(
                        "p-3 rounded-lg space-y-2",
                        getRiskColor(selectedRequest.aiResult.riskLevel)
                      )}>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Risk Level</span>
                          <Badge>{selectedRequest.aiResult.riskLevel}</Badge>
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
                        <Separator />
                        <div>
                          <h4 className="font-medium mb-2">Patient Symptoms</h4>
                          <p className="text-sm text-muted-foreground">
                            {selectedRequest.symptoms}
                          </p>
                        </div>
                      </>
                    )}

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-2">Consultation Mode</h4>
                      <Badge variant="outline" className="capitalize">
                        {selectedRequest.consultationMode}
                      </Badge>
                    </div>

                    {selectedRequest.status === 'pending' && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <Button 
                            onClick={() => handleRequestAction(selectedRequest._id, 'accept')}
                            className="w-full"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Accept Appointment
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => handleRequestAction(selectedRequest._id, 'reject')}
                            className="w-full"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Decline Request
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
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