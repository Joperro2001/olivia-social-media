
import { supabase } from "@/integrations/supabase/client";

/**
 * Handles Google sign-in authentication process
 */
export const handleGoogleSignIn = async () => {
  console.log("Google sign-in initiated");
  
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      }
    });
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Google sign in error:", error);
    alert("Error signing in with Google. Please try again later.");
  }
};
