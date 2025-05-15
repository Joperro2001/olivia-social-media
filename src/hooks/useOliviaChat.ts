
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from "@/context/AuthContext";
import { saveCityMatch } from "@/services/cityMatchService";

interface ChatMessage {
  id: string;
  content: string; // Changed from text to content to match OliviaChat.tsx
  isUser: boolean;
  timestamp: string; // Changed from Date to string to match ChatBubble component
}

const useOliviaChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false); // Added isTyping state
  const { toast } = useToast();
  const { user } = useAuth();

  const addMessage = (content: string, isUser: boolean) => {
    const newMessage = {
      id: uuidv4(),
      content, // Changed from text to content
      isUser,
      timestamp: new Date().toISOString(), // Convert Date to ISO string
    };
    setMessages(prevMessages => [...prevMessages, newMessage]);
  };

  const sendMessage = async (messageText: string): Promise<boolean> => {
    addMessage(messageText, true);
    setIsLoading(true);
    setIsTyping(true); // Set typing indicator

    try {
      // Simulate an API call to get Olivia's response
      const oliviaResponse = await getOliviaResponse(messageText);
      addMessage(oliviaResponse, false);

      // Extract city from user message and save it
      const extractedCity = extractCityFromMessage(messageText);
      if (extractedCity) {
        const userId = user?.id || 'anonymous';
        const cityMatchResult = await saveCityMatch({
          userId,
          city: extractedCity
        });

        if (cityMatchResult) {
          toast({
            title: "City Match Found!",
            description: `Olivia detected you're interested in ${extractedCity}!`,
          });
        } else {
          toast({
            title: "City Match Failed",
            description: `Failed to save city match for ${extractedCity}.`,
            variant: "destructive",
          });
        }
      }
      return true; // Return success
    } catch (error: any) {
      console.error("Error getting Olivia's response:", error);
      toast({
        title: "Error",
        description: "Failed to get Olivia's response. Please try again.",
        variant: "destructive",
      });
      addMessage("I'm having trouble connecting. Please try again later.", false);
      return false; // Return failure
    } finally {
      setIsLoading(false);
      setIsTyping(false); // Reset typing indicator
    }
  };

  // Add aliases for the OliviaChat component
  const handleSendMessage = sendMessage;
  const handleCardAction = (action: string) => sendMessage(action);
  
  const retryConnection = async (): Promise<boolean> => {
    // Simulate retrying connection
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
  };
  
  const clearChatHistory = () => {
    // Keep the initial welcome message
    const welcomeMessage = messages.length > 0 ? messages[0] : {
      id: uuidv4(),
      content: "Hi, I'm Olivia! How can I help you with your relocation journey today?",
      isUser: false,
      timestamp: new Date().toISOString(), // Convert Date to ISO string
    };
    setMessages([welcomeMessage]);
  };

  const getOliviaResponse = async (message: string): Promise<string> => {
    // Simulate a delay to mimic an API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Basic logic to determine Olivia's response
    if (message.toLowerCase().includes("hello") || message.toLowerCase().includes("hi")) {
      return "Hi there! How can I help you today?";
    } else if (message.toLowerCase().includes("relocate") || message.toLowerCase().includes("moving")) {
      return "I see you're interested in relocating! Have you considered Berlin? It's a vibrant city with lots of opportunities.";
    } else if (message.toLowerCase().includes("help")) {
      return "I can help you find information about relocating, job opportunities, and local events.";
    } else {
      return "That's interesting! Tell me more.";
    }
  };

  const extractCityFromMessage = (message: string): string | null => {
    const cities = ["Berlin", "Paris", "London", "New York", "Tokyo"];
    const lowerCaseMessage = message.toLowerCase();
    for (const city of cities) {
      if (lowerCaseMessage.includes(city.toLowerCase())) {
        return city;
      }
    }
    return null;
  };

  useEffect(() => {
    // Initial Olivia message when the component mounts
    addMessage("Hi, I'm Olivia! How can I help you with your relocation journey today?", false);
  }, []);

  return {
    messages,
    isLoading,
    isTyping,
    sendMessage,
    handleSendMessage,
    handleCardAction,
    retryConnection,
    clearChatHistory
  };
};

export default useOliviaChat;
