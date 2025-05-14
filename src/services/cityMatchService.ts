
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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

export async function getUserCityMatch() {
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
      const transformedData = {
        ...data,
        matchData: data.match_data || {}
      };
      
      // Also store in localStorage as backup
      localStorage.setItem("matchedCity", data.city);
      if (data.match_data && typeof data.match_data === 'object' && data.match_data.reason) {
        localStorage.setItem("matchedCityReason", data.match_data.reason as string);
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
