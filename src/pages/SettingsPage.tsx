
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChevronRight, Bell, Moon, Globe, Shield, CreditCard, LogOut } from "lucide-react";

const SettingsPage: React.FC = () => {
  const [nightMode, setNightMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);
  
  return (
    <div className="flex flex-col h-[100vh] bg-[#D3E4FD] pb-16">
      <div className="flex items-center justify-center py-4">
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>
      
      <div className="px-4 space-y-6 overflow-y-auto">
        <div className="rounded-2xl bg-white/90 backdrop-blur-sm shadow-sm border overflow-hidden">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-9 h-9 rounded-full bg-[#D3E4FD] flex items-center justify-center">
                <Bell className="h-5 w-5 text-gray-600" />
              </div>
              <div className="ml-3">
                <Label htmlFor="notifications" className="text-base font-medium">
                  Notifications
                </Label>
              </div>
            </div>
            <Switch
              id="notifications"
              checked={notifications}
              onCheckedChange={setNotifications}
            />
          </div>
          
          <Separator />
          
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-9 h-9 rounded-full bg-[#D3E4FD] flex items-center justify-center">
                <Moon className="h-5 w-5 text-gray-600" />
              </div>
              <div className="ml-3">
                <Label htmlFor="night-mode" className="text-base font-medium">
                  🌚 Night Owl Mode
                </Label>
              </div>
            </div>
            <Switch
              id="night-mode"
              checked={nightMode}
              onCheckedChange={setNightMode}
            />
          </div>
          
          <Separator />
          
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-9 h-9 rounded-full bg-[#D3E4FD] flex items-center justify-center">
                <Globe className="h-5 w-5 text-gray-600" />
              </div>
              <div className="ml-3">
                <Label htmlFor="location" className="text-base font-medium">
                  Location Sharing
                </Label>
              </div>
            </div>
            <Switch
              id="location"
              checked={locationSharing}
              onCheckedChange={setLocationSharing}
            />
          </div>
        </div>
        
        <div className="rounded-2xl bg-white/90 backdrop-blur-sm shadow-sm border overflow-hidden">
          <button className="w-full p-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-9 h-9 rounded-full bg-[#D3E4FD] flex items-center justify-center">
                <Shield className="h-5 w-5 text-gray-600" />
              </div>
              <div className="ml-3 text-left">
                <p className="text-base font-medium">Privacy</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>
          
          <Separator />
          
          <button className="w-full p-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-9 h-9 rounded-full bg-[#D3E4FD] flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-gray-600" />
              </div>
              <div className="ml-3 text-left">
                <p className="text-base font-medium">Subscription</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>
        </div>
        
        <div className="rounded-2xl bg-white/90 backdrop-blur-sm shadow-sm border overflow-hidden">
          <button className="w-full p-4 flex items-center text-red-500">
            <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center">
              <LogOut className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-base font-medium">Log Out</p>
            </div>
          </button>
        </div>
        
        <div className="text-center mt-8 mb-4">
          <p className="text-gray-400 text-xs">Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
