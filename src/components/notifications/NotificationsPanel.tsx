
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Calendar, X, UserPlus } from 'lucide-react';
import { Notification, useNotifications } from '@/context/NotificationsContext';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface NotificationsPanelProps {
  onClose: () => void;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ onClose }) => {
  const { notifications, markAllAsRead, markAsRead, clearNotifications } = useNotifications();
  const navigate = useNavigate();
  
  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    
    // Navigate based on notification type
    if (notification.type === 'connection' && notification.data?.profileId) {
      navigate('/matches');
    } else if ((notification.type === 'event-today' || notification.type === 'event-canceled') && notification.data?.eventId) {
      navigate(`/event/${notification.data.eventId}`);
    }
    
    onClose();
  };
  
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'connection':
        return <UserPlus className="h-5 w-5 text-primary" />;
      case 'event-canceled':
        return <X className="h-5 w-5 text-red-500" />;
      case 'event-today':
        return <Calendar className="h-5 w-5 text-green-500" />;
      default:
        return <Calendar className="h-5 w-5 text-gray-500" />;
    }
  };
  
  return (
    <div className="w-80 max-w-full bg-white rounded-lg shadow-xl border overflow-hidden">
      <div className="p-4 border-b flex items-center justify-between bg-primary/5">
        <h2 className="font-semibold">Notifications</h2>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={markAllAsRead} disabled={notifications.length === 0}>
            <Check className="h-4 w-4 mr-1" />
            Mark all read
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <ScrollArea className="h-[400px]">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No notifications</p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map(notification => (
              <Card 
                key={notification.id} 
                className={`p-4 cursor-pointer ${notification.read ? 'bg-white' : 'bg-primary/5'}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex gap-3">
                  <div className="mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{notification.title}</h4>
                    <p className="text-sm text-gray-600">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
      
      {notifications.length > 0 && (
        <div className="p-3 border-t">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-gray-500"
            onClick={clearNotifications}
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
};

export default NotificationsPanel;
