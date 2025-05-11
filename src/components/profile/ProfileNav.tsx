
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Settings, Edit, Bell, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "@/context/NotificationsContext";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import NotificationsPanel from "@/components/notifications/NotificationsPanel";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";

const ProfileNav: React.FC = () => {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  const { signOut } = useAuth();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <div className="flex items-center justify-between px-4 py-4">
      <h1 className="text-2xl font-bold">Profile</h1>
      <div className="flex items-center gap-3">
        <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="icon"
              aria-label="Notifications"
              className="rounded-full border border-gray-200 bg-white shadow-sm w-10 h-10 relative"
            >
              <Bell size={18} className="text-gray-600" />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="h-4 w-4 p-0 absolute -top-1 -right-1 flex items-center justify-center text-[10px]"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 border-none shadow-lg" align="end" sideOffset={8}>
            <NotificationsPanel onClose={() => setNotificationsOpen(false)} />
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
          onClick={() => navigate("/edit-profile")}
          aria-label="Edit Profile"
          className="rounded-full border border-gray-200 bg-white shadow-sm w-10 h-10"
        >
          <Edit size={18} className="text-gray-600" />
        </Button>
        <Button 
          variant="outline"
          size="icon"
          onClick={signOut}
          aria-label="Sign Out"
          className="rounded-full border border-gray-200 bg-white shadow-sm w-10 h-10"
        >
          <LogOut size={18} className="text-gray-600" />
        </Button>
      </div>
    </div>
  );
};

export default ProfileNav;
