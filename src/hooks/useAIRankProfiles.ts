
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useOtherProfiles } from "@/hooks/useOtherProfiles";
import { useConfig } from "@/hooks/useConfig";
import { useToast } from "@/hooks/use-toast";
import { getApiBaseUrl } from "@/utils/apiService";
import { useRanking } from "@/context/RankingContext";
import { Profile } from "@/types/Profile"; // Added import for Profile type

interface RankResponse {
  ranking: {
    user_id: string;
    full_name: string;
    summary: string;
  }[];
}

export const useAIRankProfiles = () => {
  const [isRanking, setIsRanking] = useState(false);
  const { user } = useAuth();
  const { profiles, refetchProfiles, setProfilesOrder } = useOtherProfiles();
  const { apiBaseUrl } = useConfig();
  const { toast } = useToast();
  const { setRankedProfiles, isAIRankingActive, setIsAIRankingActive } = useRanking();

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
      
      console.log("Making request to:", `${baseUrl}/rank/`);
      
      // Corrected request body to match the expected format by the backend
      const requestBody = {
        user_id: user.id // Send only the user_id of the requesting user
      };
      
      console.log("Sending request body:", JSON.stringify(requestBody));
      
      // Make request to AI ranking endpoint
      const response = await fetch(`${baseUrl}/rank/`, { // Added trailing slash
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log("API response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("API error response:", errorData);
        throw new Error(errorData.message || "Failed to rank profiles");
      }
      
      const data = await response.json() as RankResponse;
      console.log("Received ranked profiles:", data);
      
      // Extract user_ids from the ranking array
      const rankedProfileIds = data.ranking.map(profile => profile.user_id);
      console.log("Ranked profile IDs:", rankedProfileIds);
      
      // Set the new ordering of profiles based on the ranking
      setProfilesOrder(rankedProfileIds);
      
      // Store the ordered profiles in the shared context
      const rankedProfilesArray = rankedProfileIds
        .map(id => profiles.find(profile => profile.id === id))
        .filter(profile => profile !== undefined) as Profile[];
        
      // Update the shared ranking context
      setRankedProfiles(rankedProfilesArray);
      
      // Show a single toast notification instead of multiple
      toast({
        title: "AI Ranking Complete",
        description: `Ranked ${rankedProfilesArray.length} profiles based on compatibility`,
        className: "bg-gradient-to-r from-blue-500 to-purple-500 text-white border-none",
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
  }, [user, profiles, apiBaseUrl, toast, setProfilesOrder, setRankedProfiles, setIsAIRankingActive]);
  
  const toggleAIRanking = useCallback((value: boolean) => {
    setIsAIRankingActive(value);
    
    // Reset profile order if AI ranking is disabled
    if (!value) {
      refetchProfiles();
      setRankedProfiles([]);
    }
  }, [refetchProfiles, setIsAIRankingActive, setRankedProfiles]);

  return {
    isRanking,
    rankProfiles,
    isAIRankingActive,
    toggleAIRanking
  };
};
