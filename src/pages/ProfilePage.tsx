
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";

const ProfilePage: React.FC = () => {
  return (
    <div className="h-[100vh] bg-gradient-to-br from-lavender-light via-white to-mint-light pb-16">
      <ScrollArea className="h-full">
        <div className="flex flex-col pb-10">
          <div className="flex items-center justify-center py-4">
            <h1 className="text-2xl font-bold">Profile</h1>
          </div>
          
          <div className="flex flex-col items-center mt-2">
            <Avatar className="w-28 h-28 border-4 border-white shadow-md">
              <img src="https://api.dicebear.com/7.x/thumbs/svg?seed=user" alt="User profile" className="w-full h-full object-cover" />
            </Avatar>
            
            <div className="mt-4 text-center">
              <h2 className="text-xl font-bold">Alex Taylor</h2>
              <div className="flex items-center justify-center mt-1">
                <Badge className="bg-lavender-light text-primary">🗺️ Wandering in Berlin</Badge>
              </div>
            </div>
          </div>
          
          <div className="mt-8 space-y-6 px-4">
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
