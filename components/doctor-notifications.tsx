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
  User, 
  AlertTriangle, 
  CheckCircle, 
  X,
  Calendar,
  Phone
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'new_request' | 'urgent_request' | 'patient_message' | 'appointment_reminder';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  patientName?: string;
  urgency?: 'low' | 'medium' | 'high';
  actionRequired?: boolean;
}

// Mock notifications with Karnataka patient data
const mockNotifications: Notification[] = [
  {
    id: 'notif_001',
    type: 'urgent_request',
    title: 'Urgent Appointment Request',
    message: 'High-risk AI screening result detected. Immediate consultation recommended.',
    timestamp: new Date('2024-12-15T10:30:00'),
    isRead: false,
    patientName: 'Priya Sharma',
    urgency: 'high',
    actionRequired: true
  },
  {
    id: 'notif_002',
    type: 'new_request',
    title: 'New Appointment Request',
    message: 'Patient requesting online consultation for AI screening follow-up.',
    timestamp: new Date('2024-12-15T14:15:00'),
    isRead: false,
    patientName: 'Anita Reddy',
    urgency: 'medium',
    actionRequired: true
  },
  {
    id: 'notif_003',
    type: 'patient_message',
    title: 'Patient Message',
    message: 'Patient has shared additional symptoms and medical history.',
    timestamp: new Date('2024-12-15T09:45:00'),
    isRead: true,
    patientName: 'Meera Patel',
    urgency: 'low',
    actionRequired: false
  },
  {
    id: 'notif_004',
    type: 'appointment_reminder',
    title: 'Upcoming Appointment',
    message: 'Scheduled consultation in 30 minutes - Online meeting.',
    timestamp: new Date('2024-12-15T15:30:00'),
    isRead: false,
    patientName: 'Kavitha Nair',
    urgency: 'medium',
    actionRequired: false
  },
  {
    id: 'notif_005',
    type: 'new_request',
    title: 'New Appointment Request',
    message: 'Routine screening follow-up requested by patient.',
    timestamp: new Date('2024-12-14T16:20:00'),
    isRead: true,
    patientName: 'Lakshmi Devi',
    urgency: 'low',
    actionRequired: true
  }
];

export function DoctorNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const urgentCount = notifications.filter(n => n.urgency === 'high' && !n.isRead).length;

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === notificationId ? { ...notif, isRead: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
  };

  const removeNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'urgent_request':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'new_request':
        return <User className="h-4 w-4 text-blue-600" />;
      case 'patient_message':
        return <Phone className="h-4 w-4 text-green-600" />;
      case 'appointment_reminder':
        return <Calendar className="h-4 w-4 text-orange-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-4 w-4 mr-2" />
        Notifications
        {unreadCount > 0 && (
          <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs bg-red-500">
            {unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute right-0 top-full mt-2 w-96 shadow-lg z-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              <div className="flex items-center space-x-2">
                {urgentCount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {urgentCount} urgent
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs self-start p-0 h-auto"
              >
                Mark all as read
              </Button>
            )}
          </CardHeader>
          
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              <div className="space-y-1">
                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No notifications</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-4 border-l-4 cursor-pointer hover:bg-gray-50 transition-colors",
                        getUrgencyColor(notification.urgency),
                        !notification.isRead && "bg-blue-50"
                      )}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getNotificationIcon(notification.type)}
                          <span className="font-medium text-sm">
                            {notification.title}
                          </span>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notification.id);
                          }}
                          className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.message}
                      </p>
                      
                      {notification.patientName && (
                        <div className="flex items-center space-x-2 mb-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {notification.patientName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-medium">
                            {notification.patientName}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(notification.timestamp)}
                        </span>
                        {notification.actionRequired && (
                          <Badge variant="outline" className="text-xs">
                            Action Required
                          </Badge>
                        )}
                      </div>
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