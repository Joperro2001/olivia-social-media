
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { matchedProfiles, matchedGroups, rsvpEvents } from "@/data/matchesMockData";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/hooks/useProfile";

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
  const { user, signOut } = useAuth();
  const { profile, interests, isLoading } = useProfile();
  
  // Count of user's social activity
  const rsvpEventsCount = rsvpEvents.length;
  const matchesCount = matchedProfiles.filter(profile => !profile.isPending).length;
  const groupsCount = matchedGroups.length;
  
  if (isLoading) {
    return (
      <div className="h-[100vh] bg-[#FDF5EF] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="h-[100vh] bg-[#FDF5EF] flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
        <p className="text-gray-600 mb-6">There was an error loading your profile data.</p>
        <Button onClick={signOut}>Sign Out</Button>
      </div>
    );
  }
  
  return (
    <div className="h-[100vh] bg-[#FDF5EF] pb-16">
      <ScrollArea className="h-full">
        <div className="flex flex-col pb-10">
          <ProfileNav />
          
          <UserHeader 
            userName={profile.full_name || "User"}
            userAge={profile.age || 0}
          />
          
          <div className="mt-4 space-y-6 px-4">
            <UserInfoCard 
              university={profile.university || ""}
              currentCity={profile.current_city || ""}
              currentCountryFlag={profile.current_city ? "🇬🇧" : ""}
              moveInCity={profile.move_in_city || ""}
              moveInCountryFlag={profile.move_in_city ? "🇩🇪" : ""}
              nationality={profile.nationality || ""}
            />
            
            <AboutMeCard 
              aboutMe={profile.about_me || ""} 
              interests={interests.map(i => i.interest)}
            />
            
            <RelocationCard moveInCity={profile.move_in_city || ""} />
            
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
