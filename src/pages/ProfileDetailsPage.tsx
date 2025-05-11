
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageSquare } from "lucide-react";
import UserInfoCard from "@/components/profile/UserInfoCard";
import AboutMeCard from "@/components/profile/AboutMeCard";
import { motion } from "framer-motion";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { matchedProfiles } from "@/data/matchesMockData";

interface ProfileDetailsPageProps {
  // Component can receive props to override profile data
  profileData?: any;
}

const ProfileDetailsPage: React.FC<ProfileDetailsPageProps> = ({ profileData }) => {
  const { profileId } = useParams<{ profileId: string }>();
  const navigate = useNavigate();
  
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
            
            <div className="ml-auto">
              <Button 
                onClick={() => navigate(`/chat/${profile.id}`)}
                className="bg-primary flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Message
              </Button>
            </div>
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
            
            {/* About Me Section with bio */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-5 border"
            >
              <h3 className="font-semibold text-lg mb-3">About Me</h3>
              <p className="text-gray-600">
                {profile.bio}
              </p>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.3 }}
                className="mt-4 space-y-2"
              >
                <div className="flex flex-wrap gap-2 mt-3">
                  {profile.tags.map((tag: string, index: number) => (
                    <motion.div
                      key={tag}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 + index * 0.1, duration: 0.3 }}
                    >
                      <Badge variant="secondary" className="bg-lavender-light text-primary-dark hover:bg-lavender">
                        {tag}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default ProfileDetailsPage;
