
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

/**
 * Handles email/password sign-in authentication process
 */
export const handleEmailSignIn = async (email: string, password: string) => {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      throw error;
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Email sign in error:", error);
    return { 
      success: false, 
      message: error.message || "Error signing in. Please check your credentials and try again."
    };
  }
};

/**
 * Handles user registration with email/password
 */
export const handleEmailSignUp = async (email: string, password: string, userData?: any) => {
  try {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    
    if (error) {
      throw error;
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Sign up error:", error);
    return { 
      success: false, 
      message: error.message || "Error creating account. Please try again later."
    };
  }
};

/**
 * Handles user sign out
 */
export const handleSignOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Sign out error:", error);
    alert("Error signing out. Please try again.");
  }
};
