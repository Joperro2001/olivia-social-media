
import { formatDistanceToNow, parseISO } from "date-fns";
import { Profile } from "@/types/Profile";
import { supabase } from "@/integrations/supabase/client";

export interface MatchProfile {
  id: string;
  name: string;
  age: number;
  location: string;
  image: string;
  bio: string;
  matchDate: string;
  tags: string[];
  isPending?: boolean;
  hasInitialMessage?: boolean;
  messages?: string[];
}

export interface ProfileMatch {
  id: string;
  status: string;
  matched_at: string;
  user_id_1: string;
  user_id_2: string;
  otherUserId: string;
}

// Format match date to relative time
export const formatMatchDate = (timestamp: string) => {
  if (!timestamp) return 'Unknown';
  
  try {
    const matchDate = parseISO(timestamp);
    return formatDistanceToNow(matchDate, { addSuffix: true });
  } catch (error) {
    console.error("Error formatting date:", error);
    return 'Unknown date';
  }
};

// Helper function to fetch matched profiles
export const fetchMatchedProfiles = async (userId: string) => {
  try {
    // Fetch all matches related to the current user
    // Since we enforce user_id_1 < user_id_2, we need to check both scenarios
    const { data: matchesAsUser1, error: error1 } = await supabase
      .from('profile_matches')
      .select('id, status, matched_at, user_id_1, user_id_2')
      .eq('user_id_1', userId);

    const { data: matchesAsUser2, error: error2 } = await supabase
      .from('profile_matches')
      .select('id, status, matched_at, user_id_1, user_id_2')
      .eq('user_id_2', userId);

    if (error1 || error2) {
      console.error('Error fetching matches:', error1 || error2);
      throw new Error(error1?.message || error2?.message || 'Failed to fetch matches');
    }

    // Combine both match sets
    const matches: ProfileMatch[] = [];
    const otherUserIds: string[] = [];
    
    if (matchesAsUser1?.length) {
      matchesAsUser1.forEach(match => {
        matches.push({
          id: match.id,
          status: match.status,
          matched_at: match.matched_at,
          user_id_1: match.user_id_1,
          user_id_2: match.user_id_2,
          otherUserId: match.user_id_2
        });
        otherUserIds.push(match.user_id_2);
      });
    }
    
    if (matchesAsUser2?.length) {
      matchesAsUser2.forEach(match => {
        matches.push({
          id: match.id,
          status: match.status,
          matched_at: match.matched_at,
          user_id_1: match.user_id_1,
          user_id_2: match.user_id_2,
          otherUserId: match.user_id_1
        });
        otherUserIds.push(match.user_id_1);
      });
    }

    if (otherUserIds.length === 0) {
      return { matches, profilesData: [] };
    }

    // Fetch all profiles for the matched users
    const { data: matchedProfilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', otherUserIds);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw new Error(profilesError.message);
    }

    return { matches, profilesData: matchedProfilesData || [] };
  } catch (error) {
    console.error('Error in fetchMatchedProfiles:', error);
    throw error;
  }
};

// Map profiles data to the format expected by the UI
export const mapProfilesToMatchProfiles = (
  matches: ProfileMatch[],
  profilesData: Profile[]
): MatchProfile[] => {
  const formattedProfiles: MatchProfile[] = matches.map(match => {
    // Find the corresponding profile
    const profile = profilesData?.find(p => p.id === match.otherUserId);
    
    if (!profile) {
      console.warn(`Profile not found for user ID: ${match.otherUserId}`);
      return null;
    }
    
    return {
      id: profile.id,
      name: profile.full_name || 'Anonymous',
      age: profile.age || 0,
      location: profile.current_city || 'Unknown location',
      image: profile.avatar_url || '',
      bio: profile.about_me || '',
      matchDate: formatMatchDate(match.matched_at),
      tags: [],
      isPending: match.status === 'pending',
      hasInitialMessage: match.status === 'accepted',
    };
  }).filter(Boolean) as MatchProfile[];

  return formattedProfiles;
};
