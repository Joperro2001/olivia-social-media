
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useOtherProfiles } from "@/hooks/useOtherProfiles";
import { useConfig } from "@/hooks/useConfig";
import { useToast } from "@/hooks/use-toast";

export const useAIRankProfiles = () => {
  const [isRanking, setIsRanking] = useState(false);
  const [isAIRankingActive, setIsAIRankingActive] = useState(false);
  const { user } = useAuth();
  const { profiles, refetchProfiles, setProfilesOrder } = useOtherProfiles();
  const { apiBaseUrl } = useConfig();
  const { toast } = useToast();

  const rankProfiles = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsRanking(true);
      
      // Fetch current user profile to get preferences
      const { data: userProfile, error: userProfileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (userProfileError) {
        throw new Error("Couldn't fetch your profile");
      }
      
      // Make request to AI ranking endpoint
      const response = await fetch(`${apiBaseUrl}/rank`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id}`
        },
        body: JSON.stringify({
          userProfile,
          profiles: profiles.map(profile => ({
            id: profile.id,
            full_name: profile.full_name,
            age: profile.age,
            university: profile.university,
            nationality: profile.nationality,
            current_city: profile.current_city,
            move_in_city: profile.move_in_city,
            about_me: profile.about_me,
            relocation_status: profile.relocation_status,
            relocation_timeframe: profile.relocation_timeframe,
            relocation_interests: profile.relocation_interests
          }))
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to rank profiles");
      }
      
      const { rankedProfiles } = await response.json();
      
      // Set the new ordering of profiles
      setProfilesOrder(rankedProfiles);
      
    } catch (error: any) {
      console.error("Error ranking profiles:", error);
      toast({
        title: "AI Ranking Error",
        description: error.message || "There was a problem ranking profiles",
        variant: "destructive"
      });
      
      // Disable AI ranking if there's an error
      setIsAIRankingActive(false);
    } finally {
      setIsRanking(false);
    }
  }, [user, profiles, apiBaseUrl, toast, setProfilesOrder]);
  
  const toggleAIRanking = useCallback((value: boolean) => {
    setIsAIRankingActive(value);
    
    // Reset profile order if AI ranking is disabled
    if (!value) {
      refetchProfiles();
    }
  }, [refetchProfiles]);

  return {
    isRanking,
    rankProfiles,
    isAIRankingActive,
    toggleAIRanking
  };
};
