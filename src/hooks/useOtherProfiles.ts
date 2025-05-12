
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Profile } from "@/types/Profile";

export interface OtherUserProfile {
  id: string;
  name: string;
  age: number;
  location: string;
  bio: string;
  image: string;
  tags: string[];
}

export const useOtherProfiles = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<OtherUserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchProfiles = async () => {
    try {
      if (!user) return;
      
      setIsLoading(true);
      
      // Fetch other users' profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*, user_interests(interest)")
        .neq("id", user.id);

      if (profilesError) throw profilesError;

      // Transform data to match the expected format
      const transformedProfiles = await Promise.all(profilesData.map(async (profile): Promise<OtherUserProfile> => {
        // Default image if no avatar_url
        const imageUrl = profile.avatar_url || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000";
        
        // Get interests as tags
        const interests = profile.user_interests || [];
        const tags = interests.map((interest: any) => interest.interest);

        // Use current_city or nationality as location
        const location = profile.current_city 
          ? profile.current_city
          : profile.nationality || "Unknown location";

        return {
          id: profile.id,
          name: profile.full_name || "Unnamed User",
          age: profile.age || 0,
          location: location,
          bio: profile.about_me || "No bio provided",
          image: imageUrl,
          tags: tags.length > 0 ? tags : ["No interests added yet"]
        };
      }));
      
      setProfiles(transformedProfiles);
    } catch (error: any) {
      console.error("Error fetching other profiles:", error);
      toast({
        title: "Error loading profiles",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfiles();
    } else {
      setProfiles([]);
      setIsLoading(false);
    }
  }, [user]);

  return {
    profiles,
    isLoading,
    fetchProfiles
  };
};
