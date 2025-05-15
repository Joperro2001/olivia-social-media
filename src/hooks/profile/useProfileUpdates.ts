
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
          description: "You need to be logged in to update your profile.",
          variant: "destructive",
        });
        return false;
      }

      console.log("Updating profile with data:", profileData);

      // Validate required fields
      if (profileData.full_name && profileData.full_name.trim().length < 2) {
        toast({
          title: "Invalid name",
          description: "Name must be at least 2 characters",
          variant: "destructive",
        });
        return false;
      }

      // Process data before sending to database
      const processedData = {
        ...profileData,
        // Always ensure age is a number
        age: profileData.age !== undefined ? Number(profileData.age) : profile?.age,
        updated_at: new Date().toISOString(),
      };

      console.log("Processed data to send to Supabase:", processedData);

      const { error, data } = await supabase
        .from("profiles")
        .update(processedData)
        .eq("id", user.id)
        .select();

      if (error) {
        console.error("Supabase error updating profile:", error);
        
        // Provide more specific error messages based on the error code
        if (error.code === '23505') {
          toast({
            title: "Update failed",
            description: "This information is already in use by another profile.",
            variant: "destructive",
          });
        } else if (error.code === '23503') {
          toast({
            title: "Update failed",
            description: "Referenced record does not exist.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Update failed",
            description: error.message || "An unexpected error occurred.",
            variant: "destructive",
          });
        }
        
        throw error;
      }

      console.log("Profile updated successfully:", data);
      
      // Update local state with the updated profile
      setProfile((prev: Profile | null) => {
        if (!prev) return null;
        
        const updatedProfile = { ...prev, ...processedData };
        console.log("Updated local profile state:", updatedProfile);
        return updatedProfile;
      });
      
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
