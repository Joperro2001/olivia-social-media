import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Define proper interfaces for consistent typing
export interface CityMatchData {
  reason?: string;
  [key: string]: any;
}

interface CityMatchResponse {
  city: string;
  match_data: CityMatchData | null;
  created_at: string;
  id: string;
  updated_at: string;
  user_id: string;
}

export interface CityMatchReturn {
  city: string;
  matchData: CityMatchData;
  created_at?: string;
  id?: string;
  updated_at?: string;
  user_id?: string;
}

// Define parameter interface for saving city matches
export interface SaveCityMatchParams {
  userId?: string;
  city: string;
  reason?: string;
  matchData?: CityMatchData;
}

const saveCityMatchToLocalStorage = (match: CityMatchReturn) => {
  localStorage.setItem('city_match', JSON.stringify(match));
};

const getCityMatchFromLocalStorage = (): CityMatchReturn | null => {
  const match = localStorage.getItem('city_match');
  if (match) {
    return JSON.parse(match);
  }
  return null;
};

// This function parses the database response into the format expected by the UI
const parseCityMatch = (data: CityMatchResponse): CityMatchReturn => {
  // If match_data is null, initialize it as an empty object
  const matchData = data.match_data || {};
  
  return {
    city: data.city,
    matchData: matchData as CityMatchData, // Explicitly cast to CityMatchData
    created_at: data.created_at,
    id: data.id,
    updated_at: data.updated_at,
    user_id: data.user_id
  };
};

export const saveCityMatch = async (
  params: SaveCityMatchParams
): Promise<CityMatchReturn | null> => {
  try {
    const userId = params.userId || 'anonymous';
    const cityValue = params.city;
    
    // Use either the provided matchData or create one from reason
    const matchData: CityMatchData = params.matchData || { reason: params.reason || '' };

    // Check if a match already exists for this user
    const { data: existingMatch, error: fetchError } = await supabase
      .from('city_matches')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching city match:', fetchError);
      return null;
    }

    let result;

    // If a match exists, update it
    if (existingMatch) {
      const { data, error } = await supabase
        .from('city_matches')
        .update({
          city: cityValue,
          match_data: matchData
        })
        .eq('id', existingMatch.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating city match:', error);
        return null;
      }

      result = data;
    } else {
      // Otherwise, create a new match
      const { data, error } = await supabase
        .from('city_matches')
        .insert({
          user_id: userId,
          city: cityValue,
          match_data: matchData
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating city match:', error);
        return null;
      }

      result = data;
    }

    // Ensure that result.match_data is properly typed as CityMatchData
    const typedResult: CityMatchResponse = {
      ...result,
      match_data: result.match_data as CityMatchData
    };

    // Parse the result and save to localStorage
    const parsedMatch = parseCityMatch(typedResult);
    saveCityMatchToLocalStorage(parsedMatch);
    return parsedMatch;
  } catch (error) {
    console.error('Error saving city match:', error);
    return null;
  }
};

// Legacy function signature for backward compatibility
export const saveCityMatchLegacy = async (
  userIdOrParams: string,
  city: string,
  matchReason?: string
): Promise<CityMatchReturn | null> => {
  return saveCityMatch({
    userId: userIdOrParams,
    city: city, 
    reason: matchReason
  });
};

// Function to get a city match for a user
export const getCityMatch = async (userId: string): Promise<CityMatchReturn | null> => {
  try {
    // Try to get from localStorage first
    const localMatch = getCityMatchFromLocalStorage();
    
    // If we have a match in localStorage and it matches the current user, use it
    if (localMatch && localMatch.user_id === userId) {
      return localMatch;
    }
    
    // Otherwise, fetch from the database
    const { data, error } = await supabase
      .from('city_matches')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching city match:', error);
      return null;
    }

    // If we found a match, parse it and save to localStorage
    if (data) {
      // Ensure data.match_data is properly typed as CityMatchData
      const typedData: CityMatchResponse = {
        ...data,
        match_data: data.match_data as CityMatchData
      };
      
      const parsedMatch = parseCityMatch(typedData);
      saveCityMatchToLocalStorage(parsedMatch);
      return parsedMatch;
    }

    return null;
  } catch (error) {
    console.error('Error getting city match:', error);
    return null;
  }
};

// Function alias for better naming in components
export const getUserCityMatch = getCityMatch;

// Clear city match from both localStorage and database
export const clearCityMatch = async (userId?: string): Promise<boolean> => {
  try {
    // Clear from localStorage
    localStorage.removeItem('city_match');
    
    // If userId is provided, also remove from database
    if (userId) {
      const { error } = await supabase
        .from('city_matches')
        .delete()
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error deleting city match from database:', error);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error clearing city match:', error);
    return false;
  }
};
