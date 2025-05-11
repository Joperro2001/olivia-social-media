
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Maximize2 } from "lucide-react";
import UserInfoCard from "@/components/profile/UserInfoCard";
import AboutMeCard from "@/components/profile/AboutMeCard";
import { motion } from "framer-motion";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { matchedProfiles } from "@/data/matchesMockData";
import { Card } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";

interface ProfileDetailsPageProps {
  // Component can receive props to override profile data
  profileData?: any;
}

const ProfileDetailsPage: React.FC<ProfileDetailsPageProps> = ({ profileData }) => {
  const { profileId } = useParams<{ profileId: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [fullScreenImage, setFullScreenImage] = useState(false);
  
  // Find profile from matched profiles data or use provided profileData
  // Use a default profile if none is found (to avoid "Profile Not Found" message)
  const profile = profileData || matchedProfiles.find(p => p.id === profileId) || matchedProfiles[0];

  // Extract city and country from location
  const getCity = (location: string): string => {
    const cityPart = location.split(',')[0];
    return cityPart.trim();
  };

  const getCountryFlag = (location: string): string => {
    const countryMap: {[key: string]: string} = {
      'Germany': '🇩🇪',
      'Spain': '🇪🇸',
      'Netherlands': '🇳🇱',
      'UK': '🇬🇧',
      'United Kingdom': '🇬🇧',
      'France': '🇫🇷',
      'Italy': '🇮🇹'
    };
    
    for (const country in countryMap) {
      if (location.includes(country)) {
        return countryMap[country];
      }
    }
    
    return '🇪🇺'; // Default European flag
  };
  
  const city = getCity(profile.location);
  const countryFlag = getCountryFlag(profile.location);

  // Component to display based on device size
  const FullScreenComponent = isMobile ? Drawer : Dialog;
  const FullScreenContent = isMobile ? DrawerContent : DialogContent;
  
  return (
    <div className="h-[100vh] bg-[#FDF5EF] pb-16">
      <ScrollArea className="h-full">
        <div className="flex flex-col pb-10">
          {/* Header with navigation */}
          <div className="flex items-center px-4 py-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold text-left">Profile</h1>
          </div>
          
          {/* Profile Card - Responsive Layout */}
          <div className="px-3 mt-1">
            <Card className="overflow-hidden">
              <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'}`}>
                {/* Profile Image with full-screen button */}
                <div className={`${isMobile ? 'w-full h-60' : 'w-2/5 h-auto'} relative group`}>
                  <img 
                    src={profile.image} 
                    alt={profile.name} 
                    className="w-full h-full object-cover"
                  />
                  <div 
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setFullScreenImage(true)}
                  >
                    <Button variant="secondary" size="icon" className="bg-white/70 hover:bg-white/90">
                      <Maximize2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
                
                {/* Profile Info - More Compact for Mobile */}
                <div className={`w-full ${isMobile ? 'p-4' : 'w-3/5 p-6'}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold`}>{profile.name}</h2>
                    <span className="text-gray-500">• {profile.age}</span>
                  </div>
                  
                  {/* Compact User Info Card for Mobile */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{city}</span>
                      <span>{countryFlag}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Moving to Berlin 🇩🇪 • {profile.university || "University"}
                    </div>
                  </div>
                  
                  <div className={`mt-3 ${isMobile ? 'space-y-2' : 'mt-4'}`}>
                    <h3 className="font-semibold text-base mb-1">About Me</h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {profile.bio}
                    </p>
                    
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {profile.tags.map((tag: string, index: number) => (
                        <Badge 
                          key={tag}
                          variant="secondary" 
                          className="bg-lavender-light text-primary-dark text-xs py-0.5 px-2"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Full-screen image modal/dialog */}
        {isMobile ? (
          <Drawer open={fullScreenImage} onOpenChange={setFullScreenImage}>
            <DrawerContent className="h-[90vh]">
              <div className="h-full relative">
                <img 
                  src={profile.image} 
                  alt={profile.name} 
                  className="w-full h-full object-contain" 
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <h2 className="text-xl font-bold text-white">{profile.name}, {profile.age}</h2>
                  <div className="flex items-center gap-2 text-white/90">
                    <span>{city}</span>
                    <span>{countryFlag}</span>
                  </div>
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        ) : (
          <Dialog open={fullScreenImage} onOpenChange={setFullScreenImage}>
            <DialogContent className="max-w-5xl w-[90vw] h-[80vh]">
              <div className="h-full flex flex-col">
                <img 
                  src={profile.image} 
                  alt={profile.name} 
                  className="w-full h-full object-contain" 
                />
                <div className="mt-2">
                  <h2 className="text-xl font-bold">{profile.name}, {profile.age}</h2>
                  <div className="flex items-center gap-2">
                    <span>{city}</span>
                    <span>{countryFlag}</span>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </ScrollArea>
    </div>
  );
};

export default ProfileDetailsPage;
