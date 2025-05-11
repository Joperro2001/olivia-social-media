import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { matchedProfiles } from "@/data/matchesMockData";
import { 
  Drawer, 
  DrawerContent,
  DrawerClose,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card } from "@/components/ui/card";

interface ProfileDetailsPageProps {
  // Component can receive props to override profile data
  profileData?: any;
}

const ProfileDetailsPage: React.FC<ProfileDetailsPageProps> = ({ profileData }) => {
  const { profileId } = useParams<{ profileId: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // Find profile from matched profiles data
  const profile = profileData || matchedProfiles.find(p => p.id === profileId);
  
  if (!profile) {
    return (
      <div className="h-[100vh] bg-[#FDF5EF] flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-semibold mb-4">Profile Not Found</h2>
          <p className="mb-6 text-gray-600">The profile you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate("/besties")}>Return to Matches</Button>
        </div>
      </div>
    );
  }

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

  // Truncated bio for preview
  const truncatedBio = profile.bio && profile.bio.length > 100 
    ? `${profile.bio.substring(0, 100)}...` 
    : profile.bio;
  
  return (
    <div className="h-[100vh] bg-[#FDF5EF] pb-16">
      <ScrollArea className="h-full">
        <div className="flex flex-col pb-10">
          {/* Header with navigation */}
          <div className="flex items-center px-4 py-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-left">Profile</h1>
          </div>
          
          {/* User Header */}
          <div className="flex flex-col items-center mt-2">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Avatar className="w-28 h-28 border-4 border-white shadow-md">
                <img src={profile.image} alt={profile.name} className="w-full h-full object-cover" />
              </Avatar>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="mt-4 text-center"
            >
              <div className="flex items-center justify-center gap-2">
                <h2 className="text-xl font-bold">{profile.name}</h2>
                <span className="text-gray-500">• {profile.age}</span>
              </div>
            </motion.div>
          </div>
          
          <div className="mt-4 space-y-6 px-4">
            {/* Profile Card - No click action on the card itself */}
            <Card className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-5 border relative">
              <div className="space-y-5">
                {/* Preview of User Information */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary">📍</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium">{countryFlag} {profile.location}</p>
                  </div>
                </div>
                
                {/* Preview of About Me */}
                <div>
                  <h3 className="font-semibold text-lg mb-2">About Me</h3>
                  <p className="text-gray-600">
                    {truncatedBio}
                  </p>
                </div>
                
                {/* Preview of Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {profile.tags.slice(0, 3).map((tag: string) => (
                    <Badge 
                      key={tag} 
                      variant="secondary" 
                      className="bg-lavender-light text-primary-dark"
                    >
                      {tag}
                    </Badge>
                  ))}
                  {profile.tags.length > 3 && (
                    <Badge variant="outline">+{profile.tags.length - 3} more</Badge>
                  )}
                </div>

                {/* Read More button - explicitly separate from card click */}
                <div className="flex justify-center">
                  <Button 
                    onClick={() => setIsDrawerOpen(true)}
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2"
                  >
                    Read More
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Full Profile Drawer */}
            <Drawer 
              open={isDrawerOpen}
              onOpenChange={setIsDrawerOpen}
            >
              <DrawerContent className="max-h-[85vh] overflow-hidden">
                <DrawerHeader className="px-6 pt-6 pb-2">
                  <DrawerTitle className="text-xl font-semibold">{profile.name}'s Profile</DrawerTitle>
                </DrawerHeader>
                
                <ScrollArea className="flex-grow overflow-y-auto px-6 pb-4">
                  {/* User Info Section */}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3">User Information</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span>🎓</span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">University</p>
                          <p className="font-medium">University</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span>🌎</span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Nationality</p>
                          <p className="font-medium">British</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span>{countryFlag}</span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Current City</p>
                          <p className="font-medium">{profile.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span>🇩🇪</span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Moving to</p>
                          <p className="font-medium">Berlin</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* About Me Section */}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3">About Me</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {profile.bio}
                    </p>
                  </div>
                  
                  {/* Interests/Tags Section */}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3">Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.tags.map((tag: string) => (
                        <Badge 
                          key={tag} 
                          variant="secondary" 
                          className="bg-lavender-light text-primary-dark hover:bg-lavender"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </ScrollArea>
                
                <DrawerFooter className="px-6 py-4 border-t">
                  <DrawerClose asChild>
                    <Button className="w-full">Close</Button>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default ProfileDetailsPage;
