
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Interest } from "@/types/ProfileInterest";

export const useProfileInterests = (
  interests: Interest[],
  setInterests: (interests: Interest[]) => void
) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const addInterest = async (interest: string) => {
    try {
      if (!user || !interest.trim()) return false;

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

  return {
    addInterest,
    removeInterest
  };
};
