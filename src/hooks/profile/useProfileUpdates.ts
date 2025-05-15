
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Profile } from "@/types/Profile";
import { useAuth } from "@/context/AuthContext";

export const useProfileUpdates = (
  profile: Profile | null,
  setProfile: (profile: Profile | null | ((prev: Profile | null) => Profile | null)) => void
) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const updateProfile = async (profileData: Partial<Profile>) => {
    try {
      if (!user) {
        console.error("No authenticated user found");
        toast({
          title: "Authentication required",
          description: "Please log in to update your profile.",
          variant: "destructive",
        });
        return false;
      }

      console.log("Updating profile with data:", profileData);

      // Process data before sending to database
      // Ensure age is sent as a number
      const processedData = {
        ...profileData,
        age: profileData.age ? Number(profileData.age) : profile?.age,
        updated_at: new Date().toISOString(),
      };

      const { error, data } = await supabase
        .from("profiles")
        .update(processedData)
        .eq("id", user.id)
        .select();

      if (error) {
        console.error("Supabase error updating profile:", error);
        throw error;
      }

      console.log("Profile updated successfully:", data);
      
      // Update local state with the updated profile
      setProfile((prev: Profile | null) => prev ? { ...prev, ...processedData } : null);
      
      return true;
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error updating profile",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    updateProfile
  };
};
