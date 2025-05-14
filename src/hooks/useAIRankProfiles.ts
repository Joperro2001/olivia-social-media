
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useOtherProfiles } from "@/hooks/useOtherProfiles";
import { useConfig } from "@/hooks/useConfig";
import { useToast } from "@/hooks/use-toast";
import { getApiBaseUrl } from "@/utils/apiService";

interface RankResponse {
  ranking: {
    user_id: string;
    full_name: string;
    summary: string;
  }[];
}

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
      
      // Get API base URL using the helper function
      const baseUrl = getApiBaseUrl();
      if (!baseUrl) {
        throw new Error("API base URL is not configured");
      }
      
      // Make request to AI ranking endpoint
      const response = await fetch(`${baseUrl}/rank`, {
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
      
      const data = await response.json() as RankResponse;
      console.log("Received ranked profiles:", data);
      
      // Extract user_ids from the ranking array
      const rankedProfileIds = data.ranking.map(profile => profile.user_id);
      console.log("Ranked profile IDs:", rankedProfileIds);
      
      // Set the new ordering of profiles based on the ranking
      setProfilesOrder(rankedProfileIds);
      
      // Show summaries in toasts (optional)
      data.ranking.forEach((rankedProfile) => {
        toast({
          title: `Match: ${rankedProfile.full_name}`,
          description: rankedProfile.summary,
          className: "bg-gradient-to-r from-blue-500 to-purple-500 text-white border-none",
        });
      });
      
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
