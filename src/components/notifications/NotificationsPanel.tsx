
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Calendar, X, UserPlus } from 'lucide-react';
import { Notification, useNotifications } from '@/context/NotificationsContext';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

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
        return <div className="p-2 rounded-full bg-lavender-light"><UserPlus className="h-4 w-4 text-primary" /></div>;
      case 'event-canceled':
        return <div className="p-2 rounded-full bg-peach-light"><X className="h-4 w-4 text-accent" /></div>;
      case 'event-today':
        return <div className="p-2 rounded-full bg-mint-light"><Calendar className="h-4 w-4 text-mint-dark" /></div>;
      default:
        return <div className="p-2 rounded-full bg-gray-100"><Calendar className="h-4 w-4 text-gray-500" /></div>;
    }
  };
  
  return (
    <div className="w-[350px] max-w-full bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="p-4 flex items-center justify-between border-b border-gray-100">
        <h2 className="font-semibold text-lg">Notifications</h2>
        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead} 
              className="text-xs font-medium text-gray-500 hover:text-primary"
            >
              Mark all read
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full w-7 h-7 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <ScrollArea className="h-[400px]">
        {notifications.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Calendar className="h-6 w-6 text-gray-300" />
            </div>
            <p className="text-gray-400 font-medium">No notifications yet</p>
            <p className="text-gray-300 text-sm mt-1">We'll notify you when something happens</p>
          </div>
        ) : (
          <AnimatePresence>
            <div className="divide-y divide-gray-50">
              {notifications.map(notification => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${notification.read ? 'bg-white' : 'bg-primary/5'}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex gap-3">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-sm text-gray-800 line-clamp-1">{notification.title}</h4>
                        {!notification.read && (
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] h-5 ml-1">New</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </ScrollArea>
      
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-100">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-gray-500 hover:text-red-500 text-xs font-medium"
            onClick={clearNotifications}
          >
            Clear all notifications
          </Button>
        </div>
      )}
    </div>
  );
};

export default NotificationsPanel;
