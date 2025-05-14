
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Profile } from "@/types/Profile";

export const useOtherProfiles = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [userMoveInCity, setUserMoveInCity] = useState<string | null>(null);
  const [originalProfiles, setOriginalProfiles] = useState<Profile[]>([]);
  const [rejectedProfileIds, setRejectedProfileIds] = useState<string[]>(() => {
    // Initialize from localStorage if available
    const saved = localStorage.getItem("rejectedProfiles");
    return saved ? JSON.parse(saved) : [];
  });

  const fetchCurrentUserProfile = async () => {
    if (!user) return null;
    
    const { data, error } = await supabase
      .from("profiles")
      .select("move_in_city")
      .eq("id", user.id)
      .single();
      
    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
    
    return data?.move_in_city || null;
  };

  const fetchOtherProfiles = async (resetRejected = false) => {
    try {
      if (!user) {
        console.log("No user is logged in, cannot fetch profiles");
        return;
      }
      
      setIsLoading(true);
      
      // First, get the current user's move_in_city
      const moveInCity = await fetchCurrentUserProfile();
      setUserMoveInCity(moveInCity);
      
      if (!moveInCity) {
        console.log("User has no move_in_city set, showing no profiles");
        setProfiles([]);
        setOriginalProfiles([]);
        setIsLoading(false);
        return;
      }
      
      console.log("Current user ID:", user.id);
      console.log(`Fetching profiles moving to ${moveInCity} and excluding current user`);
      
      // Get the IDs of users the current user has already matched with or sent requests to
      const { data: matchesAsUser1, error: matchError1 } = await supabase
        .from('profile_matches')
        .select('user_id_2')
        .eq('user_id_1', user.id);

      const { data: matchesAsUser2, error: matchError2 } = await supabase
        .from('profile_matches')
        .select('user_id_1')
        .eq('user_id_2', user.id);
      
      if (matchError1 || matchError2) {
        console.error("Error fetching matches:", matchError1 || matchError2);
        throw new Error("Failed to fetch existing matches");
      }
      
      // Extract all user IDs that should be excluded
      const matchedUserIds = [
        ...(matchesAsUser1 ? matchesAsUser1.map(match => match.user_id_2) : []),
        ...(matchesAsUser2 ? matchesAsUser2.map(match => match.user_id_1) : [])
      ];
      
      // If we're not resetting rejected profiles, also exclude them
      let excludeIds = [...matchedUserIds];
      if (!resetRejected) {
        excludeIds = [...excludeIds, ...rejectedProfileIds];
      } else {
        // If reset was requested, clear the rejected profiles
        setRejectedProfileIds([]);
        localStorage.setItem("rejectedProfiles", JSON.stringify([]));
      }
      
      console.log("Excluding already matched/rejected users:", excludeIds);
      
      // Get all profiles moving to the same city as the user, excluding the current user and already matched/rejected users
      let query = supabase
        .from("profiles")
        .select("*")
        .neq("id", user.id)
        .eq("move_in_city", moveInCity);
      
      // Only add the "not in" filter if there are matched/rejected users to exclude
      if (excludeIds.length > 0) {
        query = query.not('id', 'in', `(${excludeIds.join(',')})`);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      console.log(`${moveInCity} profiles fetched:`, data ? data.length : 0);
      
      if (data && data.length > 0) {
        console.log("Profiles found:", data);
        // Properly type-cast the relocation_status field for each profile
        const typedProfiles: Profile[] = data.map(profile => ({
          ...profile,
          relocation_status: profile.relocation_status as Profile["relocation_status"]
        }));
        setProfiles(typedProfiles);
        setOriginalProfiles(typedProfiles); // Store the original profiles
      } else {
        console.log(`No other profiles found moving to ${moveInCity} or all users are already matched/rejected`);
        setProfiles([]);
        setOriginalProfiles([]);
      }
    } catch (error: any) {
      console.error("Error fetching other profiles:", error);
      toast({
        title: "Error loading profiles",
        description: error.message,
        variant: "destructive",
      });
      setProfiles([]);
      setOriginalProfiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to add a profile ID to rejected list
  const addRejectedProfile = (profileId: string) => {
    setRejectedProfileIds(prev => {
      const updated = [...prev, profileId];
      localStorage.setItem("rejectedProfiles", JSON.stringify(updated));
      return updated;
    });
  };

  // Function to set custom profile ordering
  const setProfilesOrder = (orderedProfileIds: string[]) => {
    if (!orderedProfileIds || orderedProfileIds.length === 0) return;
    
    // Create a map for O(1) lookups
    const profileMap = originalProfiles.reduce((acc, profile) => {
      acc[profile.id] = profile;
      return acc;
    }, {} as Record<string, Profile>);
    
    // Order profiles based on the provided ID ordering
    const orderedProfiles = orderedProfileIds
      .map(id => profileMap[id])
      .filter(profile => !!profile); // Remove any undefined profiles
    
    // Add any profiles that might not be in the ordered list (though this shouldn't happen)
    const orderedIds = new Set(orderedProfileIds);
    const remainingProfiles = originalProfiles.filter(profile => !orderedIds.has(profile.id));
    
    setProfiles([...orderedProfiles, ...remainingProfiles]);
  };

  // Reset to original order
  const resetOrder = () => {
    setProfiles([...originalProfiles]);
  };

  useEffect(() => {
    if (user) {
      console.log("User detected, initiating profile fetch");
      fetchOtherProfiles(false); // Don't reset rejected profiles on initial load
    } else {
      console.log("No user available, clearing profiles");
      setIsLoading(false);
      setProfiles([]);
      setOriginalProfiles([]);
      setRejectedProfileIds([]);
    }
  }, [user]);

  return {
    profiles,
    isLoading,
    userMoveInCity,
    refetchProfiles: fetchOtherProfiles,
    setProfilesOrder,
    resetOrder,
    addRejectedProfile,
    rejectedProfileIds
  };
};
