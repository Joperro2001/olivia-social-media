
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Profile } from "@/types/Profile";
import { useAuth } from "@/context/AuthContext";

export const useProfileUpdates = (
  profile: Profile | null,
  setProfile: (profile: Profile | null) => void
) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const updateProfile = async (profileData: Partial<Profile>) => {
    try {
      if (!user) return false;

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

  return {
    updateProfile
  };
};
