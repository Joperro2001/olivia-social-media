
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MatchProfile, ProfileMatch, fetchMatchedProfiles, mapProfilesToMatchProfiles } from "@/utils/matchHelpers";

interface UseMatchesProps {
  userId: string;
}

interface UseMatchesReturn {
  profiles: MatchProfile[];
  isLoading: boolean;
  acceptedProfiles: MatchProfile[];
  pendingProfiles: MatchProfile[];
  handleAcceptMatch: (profileId: string) => Promise<void>;
  handleDeclineMatch: (profileId: string) => Promise<void>;
  refreshMatches: () => Promise<void>;
}

export const useMatches = ({ userId }: UseMatchesProps): UseMatchesReturn => {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<MatchProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMatchesData = async () => {
    setIsLoading(true);
    try {
      const { matches, profilesData } = await fetchMatchedProfiles(userId);
      const formattedProfiles = mapProfilesToMatchProfiles(matches, profilesData);
      
      console.log('Formatted profiles:', formattedProfiles);
      setProfiles(formattedProfiles);
    } catch (error) {
      console.error('Error fetching matches:', error);
      toast({
        title: "Error",
        description: "Failed to load matches. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchMatchesData();
    }
  }, [userId]);

  // Separate profiles into accepted and pending
  const acceptedProfiles = profiles.filter(profile => !profile.isPending);
  const pendingProfiles = profiles.filter(profile => profile.isPending);

  // Handler for accepting a match request
  const handleAcceptMatch = async (profileId: string) => {
    try {
      // Find the match in the database
      const { data: matchData, error: findError } = await supabase
        .from('profile_matches')
        .select('id')
        .or(`and(user_id_1.eq.${userId},user_id_2.eq.${profileId}),and(user_id_1.eq.${profileId},user_id_2.eq.${userId})`)
        .single();

      if (findError) {
        console.error('Error finding match:', findError);
        throw new Error('Could not find the match request');
      }

      // Update the match status to accepted
      const { error: updateError } = await supabase
        .from('profile_matches')
        .update({ status: 'accepted' })
        .eq('id', matchData.id);

      if (updateError) {
        console.error('Error accepting match:', updateError);
        throw new Error('Failed to accept match request');
      }

      // Update the local state
      setProfiles(prevProfiles => 
        prevProfiles.map(profile => 
          profile.id === profileId 
            ? { ...profile, isPending: false, hasInitialMessage: true } 
            : profile
        )
      );

      toast({
        title: "Match Accepted",
        description: `You've connected with ${profiles.find(p => p.id === profileId)?.name || 'this user'}!`,
        className: "bg-gradient-to-r from-green-500 to-teal-500 text-white border-none",
      });
    } catch (error) {
      console.error('Error accepting match:', error);
      toast({
        title: "Error",
        description: "Failed to accept match request. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handler for declining a match request
  const handleDeclineMatch = async (profileId: string) => {
    try {
      // Find the match in the database
      const { data: matchData, error: findError } = await supabase
        .from('profile_matches')
        .select('id')
        .or(`and(user_id_1.eq.${userId},user_id_2.eq.${profileId}),and(user_id_1.eq.${profileId},user_id_2.eq.${userId})`)
        .single();

      if (findError) {
        console.error('Error finding match:', findError);
        throw new Error('Could not find the match request');
      }

      // Delete the match
      const { error: deleteError } = await supabase
        .from('profile_matches')
        .delete()
        .eq('id', matchData.id);

      if (deleteError) {
        console.error('Error declining match:', deleteError);
        throw new Error('Failed to decline match request');
      }

      // Update the local state
      setProfiles(prevProfiles => 
        prevProfiles.filter(profile => profile.id !== profileId)
      );

      toast({
        title: "Match Declined",
        description: `You declined the match request from ${profiles.find(p => p.id === profileId)?.name || 'this user'}.`,
      });
    } catch (error) {
      console.error('Error declining match:', error);
      toast({
        title: "Error",
        description: "Failed to decline match request. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    profiles,
    isLoading,
    acceptedProfiles,
    pendingProfiles,
    handleAcceptMatch,
    handleDeclineMatch,
    refreshMatches: fetchMatchesData
  };
};
