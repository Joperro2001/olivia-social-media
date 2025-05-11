
import React, { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

// Import refactored components
import ProfileNav from "@/components/profile/ProfileNav";
import UserHeader from "@/components/profile/UserHeader";
import UserInfoCard from "@/components/profile/UserInfoCard";
import AboutMeCard from "@/components/profile/AboutMeCard";
import RelocationCard from "@/components/profile/RelocationCard";
import PremiumCard from "@/components/profile/PremiumCard";

const ProfilePage: React.FC = () => {
  const { toast } = useToast();
  const [userCity, setUserCity] = useState<string>("Berlin"); // Default city
  const [currentCity, setCurrentCity] = useState<string>("London");
  
  // Fetch the matched city from localStorage if available
  useEffect(() => {
    const savedCity = localStorage.getItem("matchedCity");
    if (savedCity) {
      setUserCity(savedCity);
    }
  }, []);
  
  return (
    <div className="h-[100vh] bg-[#FDF5EF] pb-16">
      <ScrollArea className="h-full">
        <div className="flex flex-col pb-10">
          <ProfileNav />
          
          <UserHeader 
            userName="Alex Taylor" 
            userAge={27}
            userCity={userCity}
          />
          
          <div className="mt-8 space-y-6 px-4">
            <UserInfoCard 
              university="Technical University of Berlin"
              currentCity={currentCity}
              currentCountryFlag="🇬🇧"
              moveInCity={userCity}
              moveInCountryFlag="🇩🇪"
              nationality="British"
            />
            
            <AboutMeCard />
            
            <RelocationCard />
            
            <PremiumCard />
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default ProfilePage;
