
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/Profile";

interface UseProfileMatchingProps {
  user: any;
  onMatchFound?: () => void;
}

export const useProfileMatching = ({ user, onMatchFound }: UseProfileMatchingProps) => {
  const { toast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSwipeLeft = (id: string) => {
    console.log(`Swiped left on ${id}`);
    setCurrentIndex(prevIndex => prevIndex + 1);
  };

  const handleSwipeRight = async (id: string, profile: Profile) => {
    if (!user) {
      toast({
        title: "You need to be logged in",
        description: "Please sign in to send match requests",
        variant: "destructive",
      });
      return;
    }

    try {
      // Determine which user ID should be user_id_1 and which should be user_id_2
      // to satisfy the constraint that user_id_1 < user_id_2
      let user_id_1, user_id_2;
      
      // Compare the UUIDs as strings
      if (user.id < id) {
        user_id_1 = user.id;
        user_id_2 = id;
      } else {
        user_id_1 = id;
        user_id_2 = user.id;
      }

      // Check if a match already exists
      const { data: existingMatch, error: checkError } = await supabase
        .from('profile_matches')
        .select('id, status')
        .eq('user_id_1', user_id_1)
        .eq('user_id_2', user_id_2)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking existing match:", checkError);
        throw new Error("Failed to check for existing match");
      }

      if (existingMatch) {
        toast({
          title: "Match already exists",
          description: existingMatch.status === 'pending' 
            ? "You've already sent a match request to this user" 
            : "You're already matched with this user",
        });
      } else {
        // Create a new match request
        const { error } = await supabase.from('profile_matches').insert({
          user_id_1,
          user_id_2,
          status: 'pending'
        });

        if (error) {
          console.error("Error creating match:", error);
          throw new Error("Failed to send match request");
        } else {
          toast({
            title: "It's a match! 🎉",
            description: `You've sent a match request to ${profile.full_name}!`,
            className: "bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white border-none",
          });
          
          if (onMatchFound) {
            onMatchFound();
          }
        }
      }
    } catch (error) {
      console.error("Error sending match request:", error);
      toast({
        title: "Error",
        description: "Something went wrong while sending the match request",
        variant: "destructive",
      });
    }

    setCurrentIndex(prevIndex => prevIndex + 1);
  };

  const resetIndex = () => {
    setCurrentIndex(0);
  };

  return {
    currentIndex,
    handleSwipeLeft,
    handleSwipeRight,
    resetIndex,
    setCurrentIndex
  };
};
