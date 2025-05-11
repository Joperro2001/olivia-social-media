
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

export type Profile = {
  id: string;
  full_name: string | null;
  age: number | null;
  university: string | null;
  nationality: string | null;
  current_city: string | null;
  move_in_city: string | null;
  about_me: string | null;
};

export type Interest = {
  id: string;
  interest: string;
};

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchProfile = async () => {
    try {
      if (!user) return;
      
      setIsLoading(true);
      
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

      setProfile(profileData);
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
    }
  };

  const updateProfile = async (profileData: Partial<Profile>) => {
    try {
      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .update({
          ...profileData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      setProfile((prev) => prev ? { ...prev, ...profileData } : null);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      
      return true;
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const addInterest = async (interest: string) => {
    try {
      if (!user || !interest.trim()) return;

      const { data, error } = await supabase
        .from("user_interests")
        .insert({ 
          user_id: user.id, 
          interest: interest.trim() 
        })
        .select()
        .single();

      if (error) throw error;
      
      setInterests((prev) => [...prev, data]);
      return true;
    } catch (error: any) {
      console.error("Error adding interest:", error);
      toast({
        title: "Error adding interest",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const removeInterest = async (interestId: string) => {
    try {
      const { error } = await supabase
        .from("user_interests")
        .delete()
        .eq("id", interestId)
        .eq("user_id", user?.id);

      if (error) throw error;
      
      setInterests((prev) => prev.filter((item) => item.id !== interestId));
      return true;
    } catch (error: any) {
      console.error("Error removing interest:", error);
      toast({
        title: "Error removing interest",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setInterests([]);
      setIsLoading(false);
    }
  }, [user]);

  return {
    profile,
    interests,
    isLoading,
    fetchProfile,
    updateProfile,
    addInterest,
    removeInterest,
  };
};
