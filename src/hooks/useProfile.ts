import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Profile } from "@/types/Profile";

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

      // Convert profileData to Profile type
      // Make sure avatar_url is included
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
        avatar_url: profileData.avatar_url
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

  const uploadAvatar = async (file: File): Promise<string | null> => {
    try {
      if (!user || !file) return null;

      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload the file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get the public URL for the file
      const { data } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      // Update the profile with the new avatar URL
      if (data?.publicUrl) {
        // Update the profile in the database
        await updateProfile({ avatar_url: data.publicUrl });
        return data.publicUrl;
      }
      return null;
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        title: 'Error uploading image',
        description: error.message,
        variant: 'destructive',
      });
      return null;
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
    updateProfile,
    uploadAvatar,
    addInterest,
    removeInterest,
  };
};
