
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

export const sendChatMessage = async (
  userId: string,
  sessionId: string,
  message: string
): Promise<string | null> => {
  const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/chat`;
  
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
