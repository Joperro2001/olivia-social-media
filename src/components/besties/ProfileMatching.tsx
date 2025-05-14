
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
      // Determine which user ID should be user_id_1 and which should be user_id_2
      // to satisfy the constraint that user_id_1 < user_id_2
      let user_id_1, user_id_2;
      
      // Compare the UUIDs as strings
      if (user.id < id) {
        user_id_1 = user.id;
        user_id_2 = id;
      } else {
        user_id_1 = id;
        user_id_2 = user.id;
      }

      // Check if a match already exists
      const { data: existingMatch, error: checkError } = await supabase
        .from('profile_matches')
        .select('id, status')
        .eq('user_id_1', user_id_1)
        .eq('user_id_2', user_id_2)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking existing match:", checkError);
        throw new Error("Failed to check for existing match");
      }

      if (existingMatch) {
        toast({
          title: "Match already exists",
          description: existingMatch.status === 'pending' 
            ? "You've already sent a match request to this user" 
            : "You're already matched with this user",
        });
      } else {
        // Create a new match request
        const { error } = await supabase.from('profile_matches').insert({
          user_id_1,
          user_id_2,
          status: 'pending'
        });

        if (error) {
          console.error("Error creating match:", error);
          throw new Error("Failed to send match request");
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
    // Extract move-in city (should be Berlin) or default
    const moveInCity = profile.move_in_city || "Berlin";
    
    // Determine if they have a relocation date/timeframe (could be enhanced in the future)
    const isRelocating = Boolean(profile.move_in_city);
    
    return {
      id: profile.id,
      name: profile.full_name || "Anonymous",
      age: profile.age || 0,
      location: isRelocating ? `Moving to ${moveInCity}` : (profile.current_city || ""),
      bio: profile.about_me || "",
      image: profile.avatar_url || "",
      tags: profile.university ? [profile.university, "Moving to Berlin"] : ["Moving to Berlin"],
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
        <h3 className="text-xl font-semibold mb-2">No Berlin matches available</h3>
        <p className="text-gray-500 mb-6 max-w-xs">
          There are no other users moving to Berlin on the platform yet. Make sure your profile is set up with Berlin as your destination and try refreshing.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:opacity-90 transition-opacity flex items-center gap-2"
            onClick={() => {
              toast({
                title: "Invite link copied!",
                description: "Share this link with friends moving to Berlin to join the platform.",
              });
            }}
          >
            <UserPlus className="h-4 w-4" />
            Invite Berlin Friends
          </Button>
          <Button 
            variant="outline"
            onClick={() => {
              console.log("Refreshing profiles...");
              refetchProfiles();
              toast({
                title: "Refreshing profiles",
                description: "Looking for new Berlin connections...",
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

  // Show "All profiles viewed" message when currentIndex has reached the end of the profiles array
  if (currentIndex >= profiles.length) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="p-4 rounded-full bg-gray-100 mb-4">
          <Users className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold mb-2">You've swiped on all profiles</h3>
        <p className="text-gray-500 mb-6 max-w-xs">
          You've viewed all available profiles. Check back later for new connections or refresh to see if any new profiles are available.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:opacity-90 transition-opacity flex items-center gap-2"
            onClick={() => {
              setCurrentIndex(0);
              toast({
                title: "Starting over",
                description: "Showing profiles from the beginning",
              });
            }}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            View Profiles Again
          </Button>
          <Button 
            variant="outline"
            onClick={() => {
              refetchProfiles();
              toast({
                title: "Refreshing profiles",
                description: "Looking for new connections...",
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
      <ProfileCard
        key={profiles[currentIndex].id}
        {...mapProfileToCardProps(profiles[currentIndex])}
      />
    </div>
  );
};

export default ProfileMatching;
