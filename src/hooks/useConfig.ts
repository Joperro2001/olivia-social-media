import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Config {
  VITE_API_BASE_URL: string;
}

export function useConfig() {
  const [config, setConfig] = useState<Config | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setIsLoading(true);
        
        // Try to load from localStorage first for faster startup
        const savedConfig = localStorage.getItem('app_config');
        if (savedConfig) {
          try {
            const parsedConfig = JSON.parse(savedConfig);
            setConfig(parsedConfig);
            setIsLoading(false);
            
            // Still fetch the latest config in the background
            fetchFromSupabase();
            return;
          } catch (e) {
            // If parsing fails, continue to fetch from Supabase
            console.warn('Failed to parse saved config, fetching from Supabase');
          }
        }
        
        // Fetch from Supabase if no cached config or parsing failed
        await fetchFromSupabase();
      } catch (err: any) {
        handleError(err);
      }
    };

    const fetchFromSupabase = async (retries = 3): Promise<void> => {
      try {
        const { data, error } = await supabase.functions.invoke('get-config');
        
        if (error) {
          throw new Error(error.message || 'Failed to fetch configuration');
        }
        
        if (data) {
          const typedData = data as Config;
          setConfig(typedData);
          // Also set the config in localStorage for resilience
          localStorage.setItem('app_config', JSON.stringify(typedData));
          setIsLoading(false);
        }
      } catch (err: any) {
        console.error('Error fetching config from Supabase:', err);
        
        // Retry logic with backoff
        if (retries > 0) {
          const delay = (3 - retries + 1) * 1000; // Increasing delay: 1s, 2s, 3s
          console.log(`Retrying config fetch in ${delay}ms (${retries} attempts left)`);
          
          setTimeout(() => fetchFromSupabase(retries - 1), delay);
        } else {
          handleError(err);
        }
      }
    };
    
    const handleError = (err: any) => {
      console.error('Error fetching config:', err);
      setError(err.message || 'Failed to load application configuration');
      
      // Try to load from localStorage as fallback
      const savedConfig = localStorage.getItem('app_config');
      if (savedConfig) {
        try {
          setConfig(JSON.parse(savedConfig));
          setIsLoading(false);
        } catch (e) {
          // If parsing fails, we keep the error state
          setIsLoading(false);
          toast({
            title: "Configuration Error",
            description: "Failed to load application configuration. Please try refreshing the page.",
            variant: "destructive",
          });
        }
      } else {
        setIsLoading(false);
        toast({
          title: "Configuration Error",
          description: "Failed to load application configuration. Please try refreshing the page.",
          variant: "destructive",
        });
      }
    };

    fetchConfig();
  }, []);

  return { config, isLoading, error };
}
