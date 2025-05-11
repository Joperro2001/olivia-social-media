
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronUp } from "lucide-react";
import UserInfoCard from "@/components/profile/UserInfoCard";
import AboutMeCard from "@/components/profile/AboutMeCard";
import { motion } from "framer-motion";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { matchedProfiles } from "@/data/matchesMockData";
import { 
  Drawer, 
  DrawerContent, 
  DrawerTrigger,
  DrawerClose
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProfileDetailsPageProps {
  // Component can receive props to override profile data
  profileData?: any;
}

const ProfileDetailsPage: React.FC<ProfileDetailsPageProps> = ({ profileData }) => {
  const { profileId } = useParams<{ profileId: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  
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
  
  // Handle swipe up gesture
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setDragStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const currentY = e.touches[0].clientY;
    const diffY = dragStartY - currentY;
    
    // If swiped up by at least 50px, open the drawer
    if (diffY > 50) {
      setIsAboutExpanded(true);
      setIsDragging(false);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };
  
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
            {/* User Information Card */}
            <UserInfoCard 
              university="University"
              currentCity={city}
              currentCountryFlag={countryFlag}
              moveInCity="Moving to Berlin"
              moveInCountryFlag="🇩🇪"
              nationality="British"
            />
            
            {/* About Me Preview Section with swipe up gesture */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-5 border relative"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <h3 className="font-semibold text-lg mb-3">About Me</h3>
              <p className="text-gray-600">
                {truncatedBio}
              </p>
              
              <Drawer
                open={isAboutExpanded}
                onOpenChange={setIsAboutExpanded}
              >
                <DrawerTrigger asChild>
                  <Button 
                    variant="outline"
                    className="w-full mt-4 flex items-center justify-center gap-2"
                  >
                    <span>Read More</span>
                    <ChevronUp className="h-4 w-4 animate-bounce" />
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="p-6 max-h-[80vh] overflow-y-auto">
                  <div className="mx-auto w-full max-w-sm">
                    <h3 className="text-xl font-semibold mb-4">About {profile.name}</h3>
                    <div className="mb-6">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {profile.bio}
                      </p>
                    </div>
                    
                    {/* Tags/Interests in expanded view */}
                    <div className="mt-6">
                      <h4 className="text-sm font-medium mb-2">Interests</h4>
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

                    <DrawerClose asChild>
                      <Button className="mt-6 w-full">Close</Button>
                    </DrawerClose>
                  </div>
                </DrawerContent>
              </Drawer>
              
              {/* Swipe indicator */}
              <div className="absolute bottom-2 left-0 right-0 flex justify-center pointer-events-none">
                <div className="flex flex-col items-center">
                  <ChevronUp className="h-4 w-4 text-gray-400 animate-bounce" />
                  <span className="text-xs text-gray-400">Swipe up for more</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default ProfileDetailsPage;
