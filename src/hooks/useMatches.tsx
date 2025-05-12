
import { useState, useEffect, useCallback } from "react";
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
  const [matchData, setMatchData] = useState<ProfileMatch[]>([]);

  const fetchMatchesData = useCallback(async () => {
    if (!userId) {
      console.log("No user ID provided for fetching matches");
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      const { matches, profilesData } = await fetchMatchedProfiles(userId);
      const formattedProfiles = mapProfilesToMatchProfiles(matches, profilesData);
      
      console.log('Formatted profiles:', formattedProfiles);
      setProfiles(formattedProfiles);
      setMatchData(matches);
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
  }, [userId, toast]);

  useEffect(() => {
    if (userId) {
      fetchMatchesData();
    } else {
      setIsLoading(false);
    }
  }, [userId, fetchMatchesData]);

  // Separate profiles into accepted and pending
  const acceptedProfiles = profiles.filter(profile => !profile.isPending);
  const pendingProfiles = profiles.filter(profile => profile.isPending);

  // Find match entry for a specific profile ID
  const findMatchForProfile = (profileId: string): ProfileMatch | undefined => {
    return matchData.find(match => match.otherUserId === profileId);
  };

  // Handler for accepting a match request
  const handleAcceptMatch = async (profileId: string) => {
    try {
      const matchEntry = findMatchForProfile(profileId);
      if (!matchEntry) {
        throw new Error('Could not find the match request');
      }

      // Update the match status to accepted
      const { error: updateError } = await supabase
        .from('profile_matches')
        .update({ status: 'accepted' })
        .eq('id', matchEntry.id);

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

      // Update matchData state
      setMatchData(prevMatches => 
        prevMatches.map(match => 
          match.id === matchEntry.id 
            ? { ...match, status: 'accepted' } 
            : match
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
      const matchEntry = findMatchForProfile(profileId);
      if (!matchEntry) {
        throw new Error('Could not find the match request');
      }

      // Delete the match
      const { error: deleteError } = await supabase
        .from('profile_matches')
        .delete()
        .eq('id', matchEntry.id);

      if (deleteError) {
        console.error('Error declining match:', deleteError);
        throw new Error('Failed to decline match request');
      }

      // Update the local state
      setProfiles(prevProfiles => 
        prevProfiles.filter(profile => profile.id !== profileId)
      );

      // Update matchData state
      setMatchData(prevMatches =>
        prevMatches.filter(match => match.id !== matchEntry.id)
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
