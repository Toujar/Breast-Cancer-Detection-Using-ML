'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Bell, 
  Clock, 
  CheckCircle, 
  XCircle, 
  X,
  Calendar,
  Phone,
  User,
  AlertTriangle,
  Stethoscope,
  Hospital
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserNotification {
  _id: string;
  doctorId: {
    firstName: string;
    lastName: string;
    specialization: string;
    hospital: string;
    location: string;
  };
  patientName: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  consultationMode: 'online' | 'in-person';
  createdAt: string;
  doctorNotes?: string;
  rejectionReason?: string;
  appointmentDate?: string;
  aiResult: {
    riskLevel: 'Low' | 'Medium' | 'High';
    confidence: number;
  };
}

export function UserNotifications() {
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/appointments/user');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.requests || []);
      } else {
        console.error('Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = (notificationId: string) => {
    // In a real app, you'd make an API call to mark as read
    console.log('Mark as read:', notificationId);
  };

  const removeNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'border-l-green-500 bg-green-50';
      case 'rejected': return 'border-l-red-500 bg-red-50';
      case 'completed': return 'border-l-blue-500 bg-blue-50';
      case 'pending': return 'border-l-yellow-500 bg-yellow-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getStatusMessage = (notification: UserNotification) => {
    const doctorName = `Dr. ${notification.doctorId.firstName} ${notification.doctorId.lastName}`;
    
    switch (notification.status) {
      case 'accepted':
        return `${doctorName} accepted your appointment request.`;
      case 'rejected':
        return `${doctorName} declined your appointment request.`;
      case 'completed':
        return `Your consultation with ${doctorName} has been completed.`;
      case 'pending':
        return `Your appointment request to ${doctorName} is pending review.`;
      default:
        return 'Appointment status updated.';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const pendingCount = notifications.filter(n => n.status === 'pending').length;
  const unreadCount = notifications.filter(n => n.status === 'accepted' || n.status === 'rejected').length;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-gray-400 hover:text-white hover:bg-gray-800/50 backdrop-blur-sm transition-all duration-300"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-blue-500 text-white border-0">
            {unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute right-0 top-full mt-2 w-96 shadow-2xl z-50 bg-gray-800/95 backdrop-blur-xl border border-gray-700/50 rounded-xl">
          <CardHeader className="pb-3 border-b border-gray-700/30">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-white">Your Appointment Requests</CardTitle>
              <div className="flex items-center space-x-2">
                {pendingCount > 0 && (
                  <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                    {pendingCount} pending
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white hover:bg-gray-700/50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              <div className="space-y-1">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Loading notifications...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No appointment requests found</p>
                    <p className="text-xs mt-1">Book an appointment to see updates here</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={cn(
                        "p-4 border-l-4 hover:bg-gray-700/30 transition-colors bg-gray-800/50",
                        notification.status === 'accepted' && "border-l-green-500",
                        notification.status === 'rejected' && "border-l-red-500",
                        notification.status === 'completed' && "border-l-blue-500",
                        notification.status === 'pending' && "border-l-yellow-500"
                      )}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(notification.status)}
                          <span className="font-medium text-sm capitalize text-white">
                            {notification.status}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notification._id);
                          }}
                          className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <p className="text-sm text-gray-300 mb-3">
                        {getStatusMessage(notification)}
                      </p>
                      
                      {/* Doctor Info */}
                      <div className="flex items-center space-x-2 mb-2 p-2 bg-gray-700/50 rounded border border-gray-600">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs bg-blue-600 text-white">
                            {notification.doctorId.firstName && notification.doctorId.lastName 
                              ? `${notification.doctorId.firstName[0]}${notification.doctorId.lastName[0]}`
                              : 'DR'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate text-white">
                            Dr. {notification.doctorId.firstName} {notification.doctorId.lastName}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {notification.doctorId.specialization}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {notification.doctorId.hospital}
                          </p>
                        </div>
                      </div>

                      {/* Additional Info */}
                      <div className="space-y-1 text-xs text-gray-400">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-3 w-3" />
                          <span>Requested: {formatTimestamp(notification.createdAt)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-3 w-3" />
                          <span className="capitalize">{notification.consultationMode} consultation</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="h-3 w-3" />
                          <span>AI Risk: {notification.aiResult.riskLevel} ({notification.aiResult.confidence}%)</span>
                        </div>
                      </div>

                      {/* Doctor Notes or Rejection Reason */}
                      {notification.status === 'accepted' && notification.doctorNotes && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
                          <p className="font-medium text-green-800">Doctor's Note:</p>
                          <p className="text-green-700">{notification.doctorNotes}</p>
                        </div>
                      )}
                      
                      {notification.status === 'rejected' && notification.rejectionReason && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
                          <p className="font-medium text-red-800">Reason:</p>
                          <p className="text-red-700">{notification.rejectionReason}</p>
                        </div>
                      )}

                      {notification.appointmentDate && (
                        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                          <p className="font-medium text-blue-800">Scheduled for:</p>
                          <p className="text-blue-700">{new Date(notification.appointmentDate).toLocaleString()}</p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      {notification.status === 'accepted' && (
                        <div className="mt-3 flex space-x-2">
                          <Button size="sm" className="text-xs h-7">
                            <Calendar className="h-3 w-3 mr-1" />
                            View Details
                          </Button>
                          {notification.consultationMode === 'online' && (
                            <Button size="sm" variant="outline" className="text-xs h-7">
                              <Phone className="h-3 w-3 mr-1" />
                              Join Call
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}