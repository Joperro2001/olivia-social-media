
import { toast } from "@/hooks/use-toast";

interface ChatRequest {
  user_id: string;
  session_id: string;
  message: string;
}

interface ChatResponse {
  user_id: string;
  session_id: string;
  ai_response: string | null;
  error?: string;
}

// Helper to get API base URL from either config or localStorage
const getApiBaseUrl = (): string => {
  try {
    const savedConfig = localStorage.getItem('app_config');
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      return config.VITE_API_BASE_URL;
    }
  } catch (e) {
    console.error('Error reading config from localStorage:', e);
  }
  
  // Fallback to environment variable if available
  return import.meta.env.VITE_API_BASE_URL || '';
};

export const sendChatMessage = async (
  userId: string,
  sessionId: string,
  message: string
): Promise<string | null> => {
  const baseUrl = getApiBaseUrl();
  
  if (!baseUrl) {
    toast({
      title: "Configuration Error",
      description: "API base URL is not configured. Please refresh the page or contact support.",
      variant: "destructive",
    });
    return null;
  }
  
  const apiUrl = `${baseUrl}/chat`;
  
  try {
    const request: ChatRequest = {
      user_id: userId,
      session_id: sessionId,
      message
    };
    
    // Set timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }
    
    const data: ChatResponse = await response.json();
    
    if (data.error) {
      toast({
        title: "Error",
        description: data.error,
        variant: "destructive",
      });
      return null;
    }
    
    return data.ai_response;
  } catch (error: any) {
    console.error("Error sending chat message:", error);
    
    // Provide more specific error messages based on error type
    if (error.name === 'AbortError') {
      toast({
        title: "Request Timeout",
        description: "The AI assistant took too long to respond. Please try again.",
        variant: "destructive",
      });
    } else if (error.message?.includes('Failed to fetch')) {
      toast({
        title: "Connection Error",
        description: "Failed to reach the AI assistant. Please check your internet connection.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Communication Error",
        description: "Failed to reach the AI assistant. Please try again later.",
        variant: "destructive",
      });
    }
    
    return null;
  }
};

// Test API connectivity
export const testApiConnection = async (): Promise<boolean> => {
  const baseUrl = getApiBaseUrl();
  
  if (!baseUrl) {
    return false;
  }
  
  try {
    // Use a timeout for the connection test
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    // Just do a HEAD request to test connectivity
    const response = await fetch(`${baseUrl}`, {
      method: 'HEAD',
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.error("API connectivity test failed:", error);
    return false;
  }
};
