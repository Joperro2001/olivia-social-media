
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface Notification {
  id: string;
  type: 'connection' | 'event-canceled' | 'event-today';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  data?: {
    profileId?: string;
    eventId?: string;
    profileName?: string;
    eventName?: string;
  };
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAllAsRead: () => void;
  markAsRead: (id: string) => void;
  clearNotifications: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { toast } = useToast();
  
  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;
  
  // Add a new notification
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // Show toast for new notification
    toast({
      title: notification.title,
      description: notification.message,
      className: "bg-primary text-white",
    });
  };
  
  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };
  
  // Mark a specific notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };
  
  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
  };

  // For demo purposes, let's add some initial notifications after component mounts
  useEffect(() => {
    // Sample notifications for demonstration
    const initialNotifications: Omit<Notification, 'id' | 'timestamp' | 'read'>[] = [
      {
        type: 'connection',
        title: 'New Connection Request',
        message: 'Sarah would like to connect with you',
        data: {
          profileId: 'profile-sarah',
          profileName: 'Sarah'
        }
      },
      {
        type: 'event-today',
        title: 'Event Today',
        message: 'Berlin Expats Meetup starts in 3 hours',
        data: {
          eventId: 'event-berlin-expats',
          eventName: 'Berlin Expats Meetup'
        }
      },
      {
        type: 'event-canceled',
        title: 'Event Canceled',
        message: 'Language Exchange has been canceled',
        data: {
          eventId: 'event-language-exchange',
          eventName: 'Language Exchange'
        }
      }
    ];
    
    // Add these notifications with a slight delay to simulate receiving them
    const timer = setTimeout(() => {
      initialNotifications.forEach(notification => {
        addNotification(notification);
      });
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <NotificationsContext.Provider 
      value={{ 
        notifications, 
        unreadCount, 
        addNotification, 
        markAllAsRead, 
        markAsRead, 
        clearNotifications 
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};
