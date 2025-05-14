
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface CityMatchData {
  city: string;
  matchData?: Record<string, any>;
}

export async function saveCityMatch(cityMatch: CityMatchData) {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    const { data, error } = await supabase
      .from('city_matches')
      .insert({
        city: cityMatch.city,
        match_data: cityMatch.matchData || {},
        user_id: user.id // Add the user_id field
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Also save to localStorage as a fallback
    localStorage.setItem("matchedCity", cityMatch.city);
    
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
      return matchedCity ? { city: matchedCity } : null;
    }
    
    const { data, error } = await supabase
      .from('city_matches')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (error) throw error;
    
    // If we have data, store it in localStorage as well
    if (data) {
      localStorage.setItem("matchedCity", data.city);
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching city match:", error);
    // Fallback to localStorage
    const matchedCity = localStorage.getItem("matchedCity");
    return matchedCity ? { city: matchedCity } : null;
  }
}

export async function clearCityMatch() {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Just clear localStorage if user is not authenticated
      localStorage.removeItem("matchedCity");
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
