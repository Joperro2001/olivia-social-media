
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
      // Provide a more user-friendly error message
      if (error.message.includes("Invalid login credentials")) {
        return { 
          success: false, 
          message: "Incorrect email or password. Please try again."
        };
      }
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
      // Provide more specific error messages
      if (error.message.includes("already registered")) {
        return {
          success: false,
          message: "This email address is already registered. Please sign in instead."
        };
      }
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
