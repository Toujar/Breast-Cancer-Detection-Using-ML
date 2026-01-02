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
        return <AlertTriangle className="h-4 w-4 text-red-400" />;
      case 'new_request':
        return <User className="h-4 w-4 text-blue-400" />;
      case 'patient_message':
        return <Phone className="h-4 w-4 text-green-400" />;
      case 'appointment_reminder':
        return <Calendar className="h-4 w-4 text-orange-400" />;
      default:
        return <Bell className="h-4 w-4 text-gray-400" />;
    }
  };

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case 'high': return 'border-l-red-500 bg-red-500/10';
      case 'medium': return 'border-l-yellow-500 bg-yellow-500/10';
      case 'low': return 'border-l-green-500 bg-green-500/10';
      default: return 'border-l-gray-500 bg-gray-500/10';
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
        className="relative border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-500"
      >
        <Bell className="h-4 w-4 mr-2" />
        Notifications
        {unreadCount > 0 && (
          <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs bg-red-500 text-white border-0 flex items-center justify-center">
            {unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}

      {isOpen && (
        <Card className="absolute right-0 top-full mt-2 w-96 max-h-[500px] shadow-2xl z-50 border border-gray-700/30 bg-gray-800/95 backdrop-blur-xl">
          <CardHeader className="pb-3 border-b border-gray-700/30 sticky top-0 bg-gray-800/95 backdrop-blur-xl z-10">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-white">Notifications</CardTitle>
              <div className="flex items-center space-x-2">
                {urgentCount > 0 && (
                  <Badge className="text-xs bg-red-500/20 text-red-400 border border-red-500/30">
                    {urgentCount} urgent
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white hover:bg-gray-700/50 h-8 w-8 p-0"
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
                className="text-xs self-start p-0 h-auto text-gray-400 hover:text-white mt-2"
              >
                Mark all as read
              </Button>
            )}
          </CardHeader>
          
          <CardContent className="p-0">
            <ScrollArea className="max-h-80">
              <div className="space-y-0">
                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No notifications</p>
                  </div>
                ) : (
                  notifications.map((notification, index) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-4 border-l-4 cursor-pointer hover:bg-gray-700/30 transition-colors relative",
                        getUrgencyColor(notification.urgency),
                        !notification.isRead && "bg-blue-500/5",
                        index !== notifications.length - 1 && "border-b border-gray-700/20"
                      )}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <div className="flex-shrink-0">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <span className="font-medium text-sm text-white truncate">
                            {notification.title}
                          </span>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notification.id);
                          }}
                          className="h-6 w-6 p-0 opacity-50 hover:opacity-100 text-gray-400 hover:text-white flex-shrink-0 ml-2"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <p className="text-sm text-gray-300 mb-3 leading-relaxed">
                        {notification.message}
                      </p>
                      
                      {notification.patientName && (
                        <div className="flex items-center space-x-2 mb-3">
                          <Avatar className="h-6 w-6 flex-shrink-0">
                            <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500/20 to-indigo-500/20 text-blue-400 border border-blue-500/30">
                              {notification.patientName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-medium text-gray-300">
                            {notification.patientName}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(notification.timestamp)}
                        </span>
                        {notification.actionRequired && (
                          <Badge variant="outline" className="text-xs border-orange-500/30 text-orange-400 bg-orange-500/10">
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