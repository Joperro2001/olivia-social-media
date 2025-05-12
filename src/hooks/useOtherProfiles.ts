
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
      console.log("Fetching profiles for user:", user.id);
      
      // Fetch other users' profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*, user_interests(interest)")
        .neq("id", user.id);

      if (profilesError) throw profilesError;

      console.log("Raw profiles data:", profilesData);
      
      if (!profilesData || profilesData.length === 0) {
        console.log("No other profiles found in the database");
        // Add demo profile if no other profiles exist
        const demoProfiles: OtherUserProfile[] = [
          {
            id: "demo-1",
            name: "Alex Morgan",
            age: 28,
            location: "Barcelona, Spain 🇪🇸",
            bio: "Photographer and digital nomad. Recently moved to Barcelona and looking to connect with like-minded people!",
            image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000",
            tags: ["Photography", "Travel", "Art", "Hiking"]
          },
          {
            id: "demo-2",
            name: "Marco Deluca",
            age: 31,
            location: "Berlin, Germany 🇩🇪",
            bio: "Software engineer who loves coffee and electronic music. New to Berlin and excited to explore the city!",
            image: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=1000",
            tags: ["Tech", "Music", "Coffee", "Cycling"]
          },
          {
            id: "demo-3",
            name: "Sophia Chen",
            age: 26,
            location: "Amsterdam, Netherlands 🇳🇱",
            bio: "UX designer and plant enthusiast. Just moved from Singapore and looking to build my network here!",
            image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1000",
            tags: ["Design", "Plants", "Yoga", "Reading"]
          }
        ];
        setProfiles(demoProfiles);
        setIsLoading(false);
        return;
      }

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
      
      console.log("Transformed profiles:", transformedProfiles);
      setProfiles(transformedProfiles);
    } catch (error: any) {
      console.error("Error fetching other profiles:", error);
      toast({
        title: "Error loading profiles",
        description: error.message,
        variant: "destructive",
      });
      
      // Fallback to demo profiles in case of error
      const demoProfiles: OtherUserProfile[] = [
        {
          id: "demo-1",
          name: "Alex Morgan",
          age: 28,
          location: "Barcelona, Spain 🇪🇸",
          bio: "Photographer and digital nomad. Recently moved to Barcelona and looking to connect with like-minded people!",
          image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000",
          tags: ["Photography", "Travel", "Art", "Hiking"]
        }
      ];
      setProfiles(demoProfiles);
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
