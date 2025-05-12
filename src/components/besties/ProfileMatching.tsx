
import React, { useState } from "react";
import ProfileCard from "@/components/besties/ProfileCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useOtherProfiles } from "@/hooks/useOtherProfiles";
import { Profile } from "@/types/Profile";
import { Loader, Users } from "lucide-react";

interface ProfileMatchingProps {
  onMatchFound?: () => void;
}

const ProfileMatching: React.FC<ProfileMatchingProps> = ({ onMatchFound }) => {
  const { toast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);
  const { profiles, isLoading } = useOtherProfiles();

  const handleSwipeLeft = (id: string) => {
    console.log(`Swiped left on ${id}`);
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSwipeRight = (id: string) => {
    console.log(`Swiped right on ${id}`);
    toast({
      title: "It's a match! 🎉",
      description: `You and ${profiles[currentIndex].full_name} might be a good fit! We'll notify them.`,
      className: "bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white border-none",
    });
    
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // Convert database profile to the format expected by ProfileCard
  const mapProfileToCardProps = (profile: Profile) => {
    return {
      id: profile.id,
      name: profile.full_name || "Anonymous",
      age: profile.age || 0,
      location: profile.current_city || "",
      bio: profile.about_me || "",
      image: profile.avatar_url || "",
      tags: profile.university ? [profile.university] : [],
      onSwipeLeft: handleSwipeLeft,
      onSwipeRight: handleSwipeRight
    };
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-gray-400" />
        <p className="mt-4 text-gray-500">Loading profiles...</p>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="p-4 rounded-full bg-gray-100 mb-4">
          <Users className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No other profiles yet</h3>
        <p className="text-gray-500 mb-6">
          Invite your friends or wait for more people to join!
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4">
      {currentIndex < profiles.length ? (
        <ProfileCard
          key={profiles[currentIndex].id}
          {...mapProfileToCardProps(profiles[currentIndex])}
        />
      ) : (
        <div className="text-center px-4 py-10">
          <h3 className="text-xl font-semibold mb-2">You've seen all profiles</h3>
          <p className="text-gray-500 mb-6">Check back later for new connections</p>
          <Button 
            onClick={() => setCurrentIndex(0)}
            className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:opacity-90 transition-opacity"
          >
            Reset Profiles
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProfileMatching;
