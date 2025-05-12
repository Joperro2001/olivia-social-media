
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
      console.log("Fetching profiles with filter to exclude current user");
      
      // Filter out the current user directly in the query
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .neq("id", user.id);
      
      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      console.log("Profiles fetched:", data ? data.length : 0);
      
      if (data && data.length > 0) {
        console.log("Profiles found:", data);
        setProfiles(data);
      } else {
        console.log("No other profiles found in the database");
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
