
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { parseJsonSafely } from "@/lib/utils";

interface CityMatchData {
  city: string;
  reason?: string;
  matchData?: Record<string, any>;
}

export async function saveCityMatch(cityMatch: CityMatchData) {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    // Prepare match data object, ensuring reason is included if provided
    const matchData = {
      ...(cityMatch.matchData || {}),
      reason: cityMatch.reason || null
    };
    
    const { data, error } = await supabase
      .from('city_matches')
      .insert({
        city: cityMatch.city,
        match_data: matchData,
        user_id: user.id
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Also save to localStorage as a fallback
    localStorage.setItem("matchedCity", cityMatch.city);
    if (cityMatch.reason) {
      localStorage.setItem("matchedCityReason", cityMatch.reason);
    }
    
    return data;
  } catch (error) {
    console.error("Error saving city match:", error);
    toast({
      title: "Error",
      description: "Could not save your city match. Please try again.",
      variant: "destructive"
    });
    return null;
  }
}

// Define a proper return type for getUserCityMatch
interface CityMatchReturn {
  city: string;
  matchData?: Record<string, any>;
  // Include database fields if needed
  id?: string;
  user_id?: string;
  match_data?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export async function getUserCityMatch(): Promise<CityMatchReturn | null> {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Return data from localStorage if user is not authenticated
      const matchedCity = localStorage.getItem("matchedCity");
      const matchedReason = localStorage.getItem("matchedCityReason");
      return matchedCity ? { 
        city: matchedCity,
        matchData: matchedReason ? { reason: matchedReason } : {} 
      } : null;
    }
    
    const { data, error } = await supabase
      .from('city_matches')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (error) throw error;
    
    // Transform the database response to match our expected format
    if (data) {
      // Create a standardized return with proper type handling
      const transformedData: CityMatchReturn = {
        city: data.city,
        id: data.id,
        user_id: data.user_id,
        created_at: data.created_at,
        updated_at: data.updated_at,
        // Add matchData for consistent interface
        matchData: {}
      };
      
      // If match_data exists, parse it safely to ensure it's a proper object
      if (data.match_data) {
        // Convert the match_data to a proper Record<string, any> using our utility function
        const parsedMatchData = parseJsonSafely<Record<string, any>>(data.match_data);
        transformedData.match_data = parsedMatchData;
        
        // Check if reason exists in match_data
        if (parsedMatchData && 'reason' in parsedMatchData && parsedMatchData.reason) {
          // Add to matchData for consistent access
          transformedData.matchData = {
            reason: String(parsedMatchData.reason)
          };
          
          // Also store in localStorage as backup
          localStorage.setItem("matchedCity", data.city);
          localStorage.setItem("matchedCityReason", String(parsedMatchData.reason));
        }
      }
      
      return transformedData;
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching city match:", error);
    // Fallback to localStorage
    const matchedCity = localStorage.getItem("matchedCity");
    const matchedReason = localStorage.getItem("matchedCityReason");
    return matchedCity ? { 
      city: matchedCity,
      matchData: matchedReason ? { reason: matchedReason } : {} 
    } : null;
  }
}

export async function clearCityMatch() {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Just clear localStorage if user is not authenticated
      localStorage.removeItem("matchedCity");
      localStorage.removeItem("matchedCityReason");
      return true;
    }
    
    const { error } = await supabase
      .from('city_matches')
      .delete()
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error) throw error;
    
    // Clear localStorage too
    localStorage.removeItem("matchedCity");
    localStorage.removeItem("matchedCityReason");
    
    return true;
  } catch (error) {
    console.error("Error clearing city match:", error);
    toast({
      title: "Error",
      description: "Could not clear your city match. Please try again.",
      variant: "destructive"
    });
    return false;
  }
}
