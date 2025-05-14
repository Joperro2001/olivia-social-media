
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
export const getApiBaseUrl = (): string => {
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
    console.error('API base URL is not configured');
    
    // Show a less disruptive toast instead of a blocking error
    toast({
      title: "Offline Mode",
      description: "Using offline mode as API URL is not configured.",
      variant: "default",
    });
    
    // Return null to trigger fallback handling
    return null;
  }
  
  const apiUrl = `${baseUrl}/chat/`;
  
  try {
    const request: ChatRequest = {
      user_id: userId,
      session_id: sessionId,
      message
    };
    
    // Set timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // Increased from 10s to 30s
    
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
      console.warn("API returned error:", data.error);
      return null;
    }
    
    return data.ai_response;
  } catch (error: any) {
    console.error("Error sending chat message:", error);
    
    // Don't show error toasts anymore - we'll handle this in the UI
    // with a more graceful fallback
    
    return null;
  }
};

// Test API connectivity with reduced timeout
export const testApiConnection = async (): Promise<boolean> => {
  const baseUrl = getApiBaseUrl();
  
  if (!baseUrl) {
    return false;
  }
  
  try {
    // Use a quick timeout for the connection test - only 5 seconds
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    // Use GET request to test connectivity
    const response = await fetch(`${baseUrl}/health`, { 
      method: 'GET',
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.warn("API connectivity test failed:", error);
    return false;
  }
};
