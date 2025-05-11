
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
import { Card } from "@/components/ui/card";

interface ProfileDetailsPageProps {
  // Component can receive props to override profile data
  profileData?: any;
}

const ProfileDetailsPage: React.FC<ProfileDetailsPageProps> = ({ profileData }) => {
  const { profileId } = useParams<{ profileId: string }>();
  const navigate = useNavigate();
  
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
          
          {/* Horizontal Profile Layout - Image Left, Info Right */}
          <div className="px-4 mt-2">
            <Card className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                {/* Left side - Profile Image */}
                <div className="w-full md:w-2/5 h-64 md:h-auto">
                  <img 
                    src={profile.image} 
                    alt={profile.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Right side - Profile Info */}
                <div className="w-full md:w-3/5 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-2xl font-bold">{profile.name}</h2>
                    <span className="text-gray-500">• {profile.age}</span>
                  </div>
                  
                  <UserInfoCard 
                    university="University"
                    currentCity={city}
                    currentCountryFlag={countryFlag}
                    moveInCity="Moving to Berlin"
                    moveInCountryFlag="🇩🇪"
                    nationality="British"
                  />
                  
                  <div className="mt-4">
                    <h3 className="font-semibold text-lg mb-2">About Me</h3>
                    <p className="text-gray-600 mb-3">
                      {profile.bio}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mt-3">
                      {profile.tags.map((tag: string, index: number) => (
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
                </div>
              </div>
            </Card>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default ProfileDetailsPage;
