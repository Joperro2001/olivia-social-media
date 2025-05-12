
import React, { useState, useEffect } from "react";
import ProfileCard from "@/components/besties/ProfileCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useOtherProfiles } from "@/hooks/useOtherProfiles";
import { Profile } from "@/types/Profile";
import { Loader, Users, UserPlus, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface ProfileMatchingProps {
  onMatchFound?: () => void;
}

const ProfileMatching: React.FC<ProfileMatchingProps> = ({ onMatchFound }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const { profiles, isLoading, refetchProfiles } = useOtherProfiles();

  useEffect(() => {
    setCurrentIndex(0);
  }, [profiles.length]);

  const handleSwipeLeft = (id: string) => {
    console.log(`Swiped left on ${id}`);
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSwipeRight = async (id: string) => {
    if (!user) {
      toast({
        title: "You need to be logged in",
        description: "Please sign in to send match requests",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create a match request
      const { error } = await supabase.from('profile_matches').insert({
        user_id_1: user.id,
        user_id_2: id,
        status: 'pending'
      });

      if (error) {
        if (error.code === '23505') { // Unique violation error
          toast({
            title: "Already sent",
            description: "You've already sent a match request to this user",
          });
        } else {
          console.error("Error creating match:", error);
          toast({
            title: "Error",
            description: "Failed to send match request",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "It's a match! 🎉",
          description: `You've sent a match request to ${profiles[currentIndex].full_name}!`,
          className: "bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white border-none",
        });
        
        if (onMatchFound) {
          onMatchFound();
        }
      }
    } catch (error) {
      console.error("Error sending match request:", error);
      toast({
        title: "Error",
        description: "Something went wrong while sending the match request",
        variant: "destructive",
      });
    }

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
        <h3 className="text-xl font-semibold mb-2">No other profiles available</h3>
        <p className="text-gray-500 mb-6 max-w-xs">
          There are no other users on the platform yet. Make sure your profile is set up and try refreshing.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:opacity-90 transition-opacity flex items-center gap-2"
            onClick={() => {
              toast({
                title: "Invite link copied!",
                description: "Share this link with your friends to join the platform.",
              });
            }}
          >
            <UserPlus className="h-4 w-4" />
            Invite Friends
          </Button>
          <Button 
            variant="outline"
            onClick={() => {
              console.log("Refreshing profiles...");
              refetchProfiles();
              toast({
                title: "Refreshing profiles",
                description: "Looking for new matches...",
              });
            }}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
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
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={() => setCurrentIndex(0)}
              className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:opacity-90 transition-opacity"
            >
              Reset Profiles
            </Button>
            <Button 
              variant="outline"
              onClick={refetchProfiles}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileMatching;
