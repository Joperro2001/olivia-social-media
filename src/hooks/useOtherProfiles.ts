
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
      
      // Log to check if we have a valid user ID to filter with
      console.log("Current user ID:", user.id);
      
      // Fetch profiles excluding the current user
      const { data, error } = await supabase
        .from("profiles")
        .select("*");
      
      if (error) throw error;
      
      console.log("Raw fetched profiles:", data);
      
      // Filter out the current user after fetching if needed
      const otherProfiles = data?.filter(profile => profile.id !== user.id) || [];
      
      console.log("Filtered profiles (excluding current user):", otherProfiles);
      
      if (otherProfiles && otherProfiles.length > 0) {
        setProfiles(otherProfiles);
      } else {
        console.log("No other profiles found in database");
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
      fetchOtherProfiles();
    }
  }, [user]);

  return {
    profiles,
    isLoading,
    fetchOtherProfiles,
  };
};
