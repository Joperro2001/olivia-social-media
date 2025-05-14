
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
  // This will be undefined in production, so we rely on the edge function
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
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    });
    
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
  } catch (error) {
    console.error("Error sending chat message:", error);
    toast({
      title: "Communication Error",
      description: "Failed to reach the AI assistant. Please try again later.",
      variant: "destructive",
    });
    return null;
  }
};
