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
        
        const { data, error } = await supabase.functions.invoke('get-config');
        
        if (error) {
          throw new Error(error.message || 'Failed to fetch configuration');
        }
        
        if (data) {
          setConfig(data as Config);
          // Also set the config in localStorage for resilience
          localStorage.setItem('app_config', JSON.stringify(data));
        }
      } catch (err: any) {
        console.error('Error fetching config:', err);
        setError(err.message || 'Failed to load application configuration');
        
        // Try to load from localStorage as fallback
        const savedConfig = localStorage.getItem('app_config');
        if (savedConfig) {
          try {
            setConfig(JSON.parse(savedConfig));
          } catch (e) {
            // If parsing fails, we keep the error state
          }
        } else {
          toast({
            title: "Configuration Error",
            description: "Failed to load application configuration. Please try refreshing the page.",
            variant: "destructive",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfig();
  }, []);

  return { config, isLoading, error };
}
