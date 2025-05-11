
import React from "react";
import { Button } from "@/components/ui/button";
import { Bell, Settings, Edit } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { motion, AnimatePresence } from "framer-motion";
import NotificationsPanel from "@/components/notifications/NotificationsPanel";
import { useNavigate } from "react-router-dom";

interface ProfileNavProps {
  unreadCount: number;
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
  handleNotificationClick: () => void;
}

const ProfileNav: React.FC<ProfileNavProps> = ({
  unreadCount,
  showNotifications,
  setShowNotifications,
  handleNotificationClick
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between px-4 py-4">
      <h1 className="text-2xl font-bold">Profile</h1>
      <div className="flex items-center gap-3">
        <Popover open={showNotifications} onOpenChange={setShowNotifications}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline"
              size="icon" 
              className="relative rounded-full border border-gray-200 bg-white shadow-sm w-10 h-10"
              onClick={handleNotificationClick}
            >
              <Bell size={18} className="text-gray-600" />
              <AnimatePresence>
                {unreadCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 bg-primary text-white text-xs w-5 h-5 flex items-center justify-center rounded-full shadow-sm"
                  >
                    {unreadCount}
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="end" className="p-0 w-auto border-none shadow-xl">
            <NotificationsPanel onClose={() => setShowNotifications(false)} />
          </PopoverContent>
        </Popover>
        <Button 
          variant="outline"
          size="icon"
          onClick={() => navigate("/settings")}
          aria-label="Settings"
          className="rounded-full border border-gray-200 bg-white shadow-sm w-10 h-10"
        >
          <Settings size={18} className="text-gray-600" />
        </Button>
        <Button 
          variant="outline"
          size="icon"
          aria-label="Edit Profile"
          className="rounded-full border border-gray-200 bg-white shadow-sm w-10 h-10"
        >
          <Edit size={18} className="text-gray-600" />
        </Button>
      </div>
    </div>
  );
};

export default ProfileNav;
