
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

  const fetchOtherProfiles = async () => {
    try {
      if (!user) {
        console.log("No user is logged in, cannot fetch profiles");
        return;
      }
      
      setIsLoading(true);
      
      console.log("Current user ID:", user.id);
      console.log("Fetching profiles moving to Berlin and excluding current user");
      
      // First, get the IDs of users the current user has already matched with or sent requests to
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
      
      console.log("Excluding already matched users:", matchedUserIds);
      
      // Get all profiles excluding the current user and already matched users
      // Also filter for users who are moving to Berlin
      let query = supabase
        .from("profiles")
        .select("*")
        .neq("id", user.id)
        .eq("move_in_city", "Berlin");
      
      // Only add the "not in" filter if there are matched users to exclude
      if (matchedUserIds.length > 0) {
        query = query.not('id', 'in', `(${matchedUserIds.join(',')})`);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      console.log("Berlin profiles fetched:", data ? data.length : 0);
      
      if (data && data.length > 0) {
        console.log("Profiles found:", data);
        setProfiles(data);
      } else {
        console.log("No other profiles found moving to Berlin or all users are already matched");
        setProfiles([]);
      }
    } catch (error: any) {
      console.error("Error fetching other profiles:", error);
      toast({
        title: "Error loading profiles",
        description: error.message,
        variant: "destructive",
      });
      setProfiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      console.log("User detected, initiating profile fetch");
      fetchOtherProfiles();
    } else {
      console.log("No user available, clearing profiles");
      setIsLoading(false);
      setProfiles([]);
    }
  }, [user]);

  return {
    profiles,
    isLoading,
    refetchProfiles: fetchOtherProfiles,
  };
};
