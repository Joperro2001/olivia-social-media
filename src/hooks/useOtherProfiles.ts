
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Profile } from "@/types/Profile";
import { profiles as mockProfiles } from "@/data/bestiesMockData";

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
        console.log("Fetched real profiles:", data.length);
        setProfiles(data);
      } else {
        console.log("No real profiles found, using mock data as fallback");
        // Convert mock data to the Profile format as fallback
        const formattedMockProfiles = mockProfiles.map(profile => ({
          id: profile.id,
          full_name: profile.name,
          about_me: profile.bio,
          current_city: profile.location,
          age: profile.age,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          nationality: "",
          university: "",
          move_in_city: "",
          avatar_url: profile.image
        }));
        setProfiles(formattedMockProfiles);
        
        toast({
          title: "Demo Mode",
          description: "No other users found. Showing demo profiles instead.",
        });
      }
    } catch (error: any) {
      console.error("Error fetching other profiles:", error);
      toast({
        title: "Error loading profiles",
        description: error.message,
        variant: "destructive",
      });
      
      // Fallback to mock data in case of error
      const formattedMockProfiles = mockProfiles.map(profile => ({
        id: profile.id,
        full_name: profile.name,
        about_me: profile.bio,
        current_city: profile.location,
        age: profile.age,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        nationality: "",
        university: "",
        move_in_city: "",
        avatar_url: profile.image
      }));
      setProfiles(formattedMockProfiles);
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
