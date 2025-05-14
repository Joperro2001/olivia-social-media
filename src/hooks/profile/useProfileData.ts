
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Profile } from "@/types/Profile";
import { Interest } from "@/types/ProfileInterest";

export const useProfileData = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const fetchInProgress = useRef(false);
  const initialFetchDone = useRef(false);
  
  const fetchProfile = async () => {
    try {
      if (!user || fetchInProgress.current) return;
      
      fetchInProgress.current = true;
      
      console.log("Fetching profile data for user:", user.id);
      
      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;
      
      // Fetch interests
      const { data: interestsData, error: interestsError } = await supabase
        .from("user_interests")
        .select("*")
        .eq("user_id", user.id);

      if (interestsError) throw interestsError;

      // Convert profileData to Profile type with proper type casting for enum fields
      const relocationStatus = profileData.relocation_status as Profile["relocation_status"];
      
      setProfile({
        about_me: profileData.about_me,
        age: profileData.age,
        created_at: profileData.created_at,
        current_city: profileData.current_city,
        full_name: profileData.full_name,
        id: profileData.id,
        move_in_city: profileData.move_in_city,
        nationality: profileData.nationality,
        university: profileData.university,
        updated_at: profileData.updated_at,
        avatar_url: profileData.avatar_url,
        relocation_status: relocationStatus,
        relocation_timeframe: profileData.relocation_timeframe,
        relocation_interests: profileData.relocation_interests
      });
      
      setInterests(interestsData || []);
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error loading profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      fetchInProgress.current = false;
      initialFetchDone.current = true;
    }
  };

  useEffect(() => {
    if (user && !initialFetchDone.current) {
      fetchProfile();
    } else if (!user) {
      setProfile(null);
      setInterests([]);
      setIsLoading(false);
      initialFetchDone.current = false;
    }
    // We're intentionally only depending on user to prevent extra fetches
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return {
    profile,
    interests,
    isLoading,
    fetchProfile,
    setProfile,
    setInterests
  };
};
