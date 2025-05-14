
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Config {
  apiBaseUrl: string;
}

export const useConfig = () => {
  const [config, setConfig] = useState<Config>({
    apiBaseUrl: process.env.VITE_API_BASE_URL || "http://localhost:8000",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setIsLoading(true);
        
        // Try to get config from Supabase Edge Function
        const { data, error } = await supabase.functions.invoke("get-config");
        
        if (!error && data && data.VITE_API_BASE_URL) {
          setConfig({
            apiBaseUrl: data.VITE_API_BASE_URL,
          });
        }
      } catch (error) {
        console.error("Error fetching config:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfig();
  }, []);

  return {
    ...config,
    isLoading,
  };
};
