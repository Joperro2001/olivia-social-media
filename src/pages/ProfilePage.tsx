
import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Edit, Settings, Bell, MapPin, University, Flag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/context/NotificationsContext";
import NotificationsPanel from "@/components/notifications/NotificationsPanel";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { motion, AnimatePresence } from "framer-motion";

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { unreadCount, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [userCity, setUserCity] = useState<string>("Berlin"); // Default city
  const [currentCity, setCurrentCity] = useState<string>("London");
  
  // Fetch the matched city from localStorage if available
  useEffect(() => {
    const savedCity = localStorage.getItem("matchedCity");
    if (savedCity) {
      setUserCity(savedCity);
    }
  }, []);
  
  const handleNotificationClick = () => {
    setShowNotifications(prev => !prev);
  };
  
  return (
    <div className="h-[100vh] bg-[#FDF5EF] pb-16">
      <ScrollArea className="h-full">
        <div className="flex flex-col pb-10">
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
          
          <div className="flex flex-col items-center mt-2">
            <Avatar className="w-28 h-28 border-4 border-white shadow-md">
              <img src="https://api.dicebear.com/7.x/thumbs/svg?seed=user" alt="User profile" className="w-full h-full object-cover" />
            </Avatar>
            
            <div className="mt-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <h2 className="text-xl font-bold">Alex Taylor</h2>
                <span className="text-gray-500">• 27</span>
              </div>
              <div className="flex items-center justify-center mt-1">
                <Badge className="bg-lavender-dark text-primary">🗺️ Moving to {userCity}</Badge>
              </div>
            </div>
          </div>
          
          <div className="mt-8 space-y-6 px-4">
            {/* User Info Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-5 border">
              <h3 className="font-semibold text-lg mb-3">User Information</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <University className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">University</p>
                    <p className="font-medium">Technical University of Berlin</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Flag className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Current City</p>
                    <p className="font-medium">🇬🇧 {currentCity}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">City for Move-in</p>
                    <p className="font-medium">🇩🇪 {userCity}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-5 border">
              <h3 className="font-semibold text-lg mb-3">About Me</h3>
              <p className="text-gray-600">
                Tech professional exploring Berlin for 6 months. Looking to connect with fellow expats, find great workspaces, and explore the local culture.
              </p>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Goals</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">Find apartment</Badge>
                  <Badge variant="outline">Make local friends</Badge>
                  <Badge variant="outline">Learn German</Badge>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Languages</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">English (Native)</Badge>
                  <Badge variant="secondary">German (Basic)</Badge>
                  <Badge variant="secondary">Spanish (Intermediate)</Badge>
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-5 border">
              <h3 className="font-semibold text-lg mb-4">Relocation Progress</h3>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Preparation</span>
                    <span className="text-xs font-medium">80%</span>
                  </div>
                  <Progress value={80} className="h-2" />
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Housing</span>
                    <span className="text-xs font-medium">30%</span>
                  </div>
                  <Progress value={30} className="h-2" />
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Paperwork</span>
                    <span className="text-xs font-medium">50%</span>
                  </div>
                  <Progress value={50} className="h-2" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-primary/90 to-primary p-5 rounded-2xl text-white shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">Upgrade to Premium</h3>
                  <p className="text-sm opacity-90 mt-1">
                    Get unlimited matches and premium features
                  </p>
                </div>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#FFD700" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <Button className="mt-4 w-full bg-white text-primary hover:bg-white/90 font-medium">
                Upgrade Now
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default ProfilePage;
