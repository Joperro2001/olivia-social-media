
import React, { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { matchedProfiles, matchedGroups, rsvpEvents } from "@/data/matchesMockData";

// Import refactored components
import ProfileNav from "@/components/profile/ProfileNav";
import UserHeader from "@/components/profile/UserHeader";
import UserInfoCard from "@/components/profile/UserInfoCard";
import AboutMeCard from "@/components/profile/AboutMeCard";
import RelocationCard from "@/components/profile/RelocationCard";
import PremiumCard from "@/components/profile/PremiumCard";
import ProfileStats from "@/components/profile/ProfileStats";

const ProfilePage: React.FC = () => {
  const { toast } = useToast();
  const [currentCity, setCurrentCity] = useState<string>("London");
  
  // Count of user's social activity
  const rsvpEventsCount = rsvpEvents.length;
  const matchesCount = matchedProfiles.filter(profile => !profile.isPending).length;
  const groupsCount = matchedGroups.length;
  
  return (
    <div className="h-[100vh] bg-[#FDF5EF] pb-16">
      <ScrollArea className="h-full">
        <div className="flex flex-col pb-10">
          <ProfileNav />
          
          <UserHeader 
            userName="Alex Taylor" 
            userAge={27}
          />
          
          <div className="mt-4 space-y-6 px-4">
            <UserInfoCard 
              university="LSE"
              currentCity={currentCity}
              currentCountryFlag="🇬🇧"
              moveInCity="Berlin"
              moveInCountryFlag="🇩🇪"
              nationality="British"
            />
            
            <AboutMeCard />
            
            <RelocationCard />
            
            {/* Moved ProfileStats here between RelocationCard and PremiumCard */}
            <div className="px-4 -mx-4">
              <ProfileStats
                rsvpEventsCount={rsvpEventsCount}
                matchesCount={matchesCount}
                groupsCount={groupsCount}
              />
            </div>
            
            <PremiumCard />
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default ProfilePage;
