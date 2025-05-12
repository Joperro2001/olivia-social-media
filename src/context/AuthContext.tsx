
import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { handleSignOut, handleEmailSignIn, handleEmailSignUp, handleGoogleSignIn } from "@/utils/auth";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signUp: (email: string, password: string, userData?: any) => Promise<{ success: boolean; message?: string }>;
  googleSignIn: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up the auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsLoading(false);
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await handleSignOut();
    navigate("/signin");
  };

  const signIn = async (email: string, password: string) => {
    return await handleEmailSignIn(email, password);
  };

  const signUp = async (email: string, password: string, userData?: any) => {
    return await handleEmailSignUp(email, password, userData);
  };

  const googleSignIn = async () => {
    await handleGoogleSignIn();
  };

  const value = {
    user,
    session,
    isLoading,
    signOut,
    signIn,
    signUp,
    googleSignIn
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
