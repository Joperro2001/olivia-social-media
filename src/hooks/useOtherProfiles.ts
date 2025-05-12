
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
      
      // Fetch profiles excluding the current user
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .neq("id", user.id);

      if (error) throw error;
      
      if (data && data.length > 0) {
        console.log("Fetched profiles:", data.length);
        setProfiles(data);
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
