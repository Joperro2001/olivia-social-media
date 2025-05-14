
import React, { useEffect } from "react";
import ProfileCard from "@/components/besties/ProfileCard";
import ProfileLoadingState from "@/components/besties/ProfileLoadingState";
import EmptyProfilesState from "@/components/besties/EmptyProfilesState";
import NoMoreProfiles from "@/components/besties/NoMoreProfiles";
import { useToast } from "@/hooks/use-toast";
import { useOtherProfiles } from "@/hooks/useOtherProfiles";
import { useProfileMatching } from "@/hooks/useProfileMatching";
import { mapProfileToCardProps } from "@/utils/profileCardMapper";
import { useAuth } from "@/context/AuthContext";

interface ProfileMatchingProps {
  onMatchFound?: () => void;
}

const ProfileMatching: React.FC<ProfileMatchingProps> = ({ onMatchFound }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { profiles, isLoading, refetchProfiles } = useOtherProfiles();
  const { currentIndex, handleSwipeLeft, handleSwipeRight, resetIndex, setCurrentIndex } = useProfileMatching({ 
    user, 
    onMatchFound 
  });

  // Reset the index when profiles change
  useEffect(() => {
    resetIndex();
  }, [profiles.length]);

  const handleRefresh = () => {
    console.log("Refreshing profiles while keeping rejected profiles filtered out...");
    refetchProfiles();
    toast({
      title: "Refreshing profiles",
      description: "Looking for new Berlin connections...",
    });
  };

  if (isLoading) {
    return <ProfileLoadingState />;
  }

  if (profiles.length === 0) {
    return <EmptyProfilesState onRefresh={handleRefresh} />;
  }

  // Show "All profiles viewed" message when currentIndex has reached the end of the profiles array
  if (currentIndex >= profiles.length) {
    return (
      <NoMoreProfiles 
        onRefresh={handleRefresh} 
        onStartOver={() => setCurrentIndex(0)} 
      />
    );
  }

  // Prepare the current profile card
  const currentProfile = profiles[currentIndex];
  const handleProfileSwipeLeft = (id: string) => handleSwipeLeft(id);
  const handleProfileSwipeRight = (id: string) => handleSwipeRight(id, currentProfile);

  const profileCardProps = mapProfileToCardProps(
    currentProfile,
    handleProfileSwipeLeft,
    handleProfileSwipeRight
  );

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4">
      <ProfileCard {...profileCardProps} />
    </div>
  );
};

export default ProfileMatching;
