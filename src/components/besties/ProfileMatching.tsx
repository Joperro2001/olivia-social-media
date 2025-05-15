
import React, { useState, useEffect } from "react";
import ProfileCard from "@/components/besties/ProfileCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useOtherProfiles } from "@/hooks/useOtherProfiles";
import { Profile } from "@/types/Profile";
import { Loader, Users, UserPlus, RefreshCw, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useRanking } from "@/context/RankingContext";
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";

interface ProfileMatchingProps {
  onMatchFound?: () => void;
}

const ProfileMatching: React.FC<ProfileMatchingProps> = ({ onMatchFound }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const { 
    profiles, 
    isLoading, 
    refetchProfiles,
    loadMoreProfiles,
    hasMoreProfiles,
    markProfileViewed,
    viewedProfiles
  } = useOtherProfiles();
  const { rankedProfiles, isAIRankingActive } = useRanking();
  
  // Use ranked profiles if AI ranking is active, otherwise use regular profiles
  const displayProfiles = isAIRankingActive && rankedProfiles.length > 0
    ? rankedProfiles
    : profiles;

  // Debug logging 
  useEffect(() => {
    console.log("ProfileMatching component rendered");
    console.log("Current index:", currentIndex);
    console.log("Display profiles count:", displayProfiles.length);
    console.log("All profiles:", displayProfiles.map(p => `${p.full_name} (${p.id})`).join(", "));
    console.log("Viewed profiles:", Array.from(viewedProfiles));
  }, [currentIndex, displayProfiles, viewedProfiles]);

  // Reset current index when profiles change
  useEffect(() => {
    if (displayProfiles.length > 0 && currentIndex >= displayProfiles.length) {
      console.log("Resetting current index because it's out of bounds");
      setCurrentIndex(0);
    }
  }, [displayProfiles.length]);

  // Mark current profile as viewed
  useEffect(() => {
    if (displayProfiles.length > 0 && currentIndex < displayProfiles.length) {
      const currentProfileId = displayProfiles[currentIndex].id;
      markProfileViewed(currentProfileId);
    }
  }, [currentIndex, displayProfiles]);

  // Try to load more profiles if we're approaching the end
  useEffect(() => {
    if (hasMoreProfiles && displayProfiles.length - currentIndex < 3) {
      console.log("Approaching end of profiles list, loading more...");
      loadMoreProfiles();
    }
  }, [currentIndex, displayProfiles.length, hasMoreProfiles]);

  const handleSwipeLeft = (id: string) => {
    console.log(`Swiped left on ${id}`);
    console.log(`Current index: ${currentIndex}, Total profiles: ${displayProfiles.length}`);
    
    if (currentIndex < displayProfiles.length - 1) {
      setCurrentIndex(prevIndex => prevIndex + 1);
    } else if (hasMoreProfiles) {
      // Try to load more profiles
      loadMoreProfiles();
      // Stay on the same index, the effect will move forward when profiles load
    } else {
      // If we're at the last profile, show the "no more profiles" message
      console.log("Reached the end of profiles");
    }
  };

  const handleSwipeRight = async (id: string) => {
    console.log(`Swiped right on ${id}`);
    console.log(`Current index: ${currentIndex}, Total profiles: ${displayProfiles.length}`);
    
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
            description: `You've sent a match request to ${displayProfiles[currentIndex].full_name}!`,
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

    // Move to the next profile
    if (currentIndex < displayProfiles.length - 1) {
      setCurrentIndex(prevIndex => prevIndex + 1);
    } else if (hasMoreProfiles) {
      // Try to load more profiles
      loadMoreProfiles();
      // Stay on the same index, the effect will move forward when profiles load
    } else {
      // If we're at the last profile, display the "no more profiles" message
      console.log("Reached the end of profiles");
    }
  };

  // Convert database profile to the format expected by ProfileCard
  const mapProfileToCardProps = (profile: Profile) => {
    // Extract move-in city or default to Berlin
    const moveInCity = profile.move_in_city || "Berlin";
    
    // Determine if they have a relocation date/timeframe
    const isRelocating = Boolean(profile.move_in_city);
    
    // Format tags to include relocation interests and other profile data
    let tags: string[] = [];
    
    // Add university if available
    if (profile.university) {
      tags.push(profile.university);
    }
    
    // Add moving location tag
    if (isRelocating) {
      tags.push(`Moving to ${moveInCity}`);
    }
    
    // Add relocation interests as tags if available
    if (profile.relocation_interests && Array.isArray(profile.relocation_interests)) {
      tags = [...tags, ...profile.relocation_interests];
    }
    
    // Add fallback tags if none are available
    if (tags.length === 0) {
      tags = ["New user", "Looking for connections"];
    }
    
    // Log the mapping for debugging
    console.log(`Mapping profile ${profile.id} (${profile.full_name}) to card props`);
    
    return {
      id: profile.id,
      name: profile.full_name || "Anonymous",
      age: profile.age || 0,
      location: isRelocating ? `${moveInCity}, International` : (profile.current_city || ""),
      bio: profile.about_me || "",
      image: profile.avatar_url || "",
      tags: tags,
      onSwipeLeft: handleSwipeLeft,
      onSwipeRight: handleSwipeRight
    };
  };

  const handleJumpToProfile = (index: number) => {
    if (index >= 0 && index < displayProfiles.length) {
      setCurrentIndex(index);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-gray-400" />
        <p className="mt-4 text-gray-500">Loading profiles...</p>
      </div>
    );
  }

  if (displayProfiles.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="p-4 rounded-full bg-gray-100 mb-4">
          <Users className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No matches available</h3>
        <p className="text-gray-500 mb-6 max-w-xs">
          There are no users matching your criteria. Try refreshing or changing your search preferences.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:opacity-90 transition-opacity flex items-center gap-2"
            onClick={() => {
              toast({
                title: "Invite link copied!",
                description: "Share this link with friends to join the platform.",
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
              setCurrentIndex(0);
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

  console.log(`Rendering profile at index ${currentIndex} out of ${displayProfiles.length} profiles`);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4">
      {currentIndex < displayProfiles.length ? (
        <>
          <ProfileCard
            key={displayProfiles[currentIndex].id}
            {...mapProfileToCardProps(displayProfiles[currentIndex])}
          />
          
          {displayProfiles.length > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => {
                        if (currentIndex > 0) {
                          setCurrentIndex(currentIndex - 1);
                        }
                      }}
                      className={currentIndex === 0 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  
                  {displayProfiles.length <= 5 ? (
                    // Show all page numbers if 5 or fewer
                    displayProfiles.map((_, index) => (
                      <PaginationItem key={index}>
                        <PaginationLink 
                          onClick={() => handleJumpToProfile(index)}
                          isActive={currentIndex === index}
                        >
                          {index + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))
                  ) : (
                    // Show limited page numbers with ellipsis for larger sets
                    <>
                      <PaginationItem>
                        <PaginationLink
                          onClick={() => handleJumpToProfile(0)}
                          isActive={currentIndex === 0}
                        >
                          1
                        </PaginationLink>
                      </PaginationItem>
                      
                      {currentIndex > 2 && (
                        <PaginationItem>
                          <PaginationLink>...</PaginationLink>
                        </PaginationItem>
                      )}
                      
                      {currentIndex > 1 && currentIndex < displayProfiles.length - 2 && (
                        <PaginationItem>
                          <PaginationLink
                            onClick={() => handleJumpToProfile(currentIndex)}
                            isActive
                          >
                            {currentIndex + 1}
                          </PaginationLink>
                        </PaginationItem>
                      )}
                      
                      {currentIndex < displayProfiles.length - 3 && (
                        <PaginationItem>
                          <PaginationLink>...</PaginationLink>
                        </PaginationItem>
                      )}
                      
                      <PaginationItem>
                        <PaginationLink
                          onClick={() => handleJumpToProfile(displayProfiles.length - 1)}
                          isActive={currentIndex === displayProfiles.length - 1}
                        >
                          {displayProfiles.length}
                        </PaginationLink>
                      </PaginationItem>
                    </>
                  )}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => {
                        if (currentIndex < displayProfiles.length - 1) {
                          setCurrentIndex(currentIndex + 1);
                        }
                      }}
                      className={currentIndex === displayProfiles.length - 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      ) : (
        <div className="text-center px-4 py-10">
          <h3 className="text-xl font-semibold mb-2">You've seen all profiles</h3>
          <p className="text-gray-500 mb-6">Check back later for new connections</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={() => {
                console.log("Resetting profiles index to 0");
                setCurrentIndex(0);
              }}
              className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:opacity-90 transition-opacity"
            >
              Reset Profiles
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                console.log("Refreshing profiles...");
                refetchProfiles();
                setCurrentIndex(0);
              }}
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
