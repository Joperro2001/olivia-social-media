
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
      if (!user) return;
      
      setIsLoading(true);
      
      console.log("Current user ID:", user.id);
      
      // Fetch all profiles without filtering in the query
      const { data: allProfiles, error } = await supabase
        .from("profiles")
        .select("*");
      
      if (error) {
        throw error;
      }
      
      console.log("All profiles fetched:", allProfiles);
      
      // Filter out the current user client-side
      const otherProfiles = allProfiles.filter(profile => profile.id !== user.id);
      
      console.log("Filtered profiles (excluding current user):", otherProfiles);
      
      setProfiles(otherProfiles || []);
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
      fetchOtherProfiles();
    } else {
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
