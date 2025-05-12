
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
      
      // Directly filter out the current user in the SQL query instead of client-side filtering
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .neq("id", user.id);
      
      if (error) {
        throw error;
      }
      
      console.log("Profiles of other users:", data);
      
      setProfiles(data || []);
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
