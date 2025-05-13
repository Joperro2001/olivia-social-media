
import { useAuth } from "@/context/AuthContext";
import { useChatState } from "./chat/useChatState";
import { useChatSubscription } from "./chat/useChatSubscription";
import { useChatInitialization } from "./chat/useChatInitialization";
import { useSendMessage } from "./chat/useSendMessage";
import { testDatabaseConnection } from "@/utils/chatUtils";
import { useToast } from "@/hooks/use-toast";

interface UseChatProps {
  profileId: string;
}

export const useChat = ({ profileId }: UseChatProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Get state management functions
  const {
    messages, setMessages,
    isLoading, setIsLoading,
    chatId, setChatId,
    connectionError, setConnectionError
  } = useChatState();

  // Initialize chat
  const { initializeChat, fetchMessages } = useChatInitialization({
    userId: user?.id,
    profileId,
    setIsLoading,
    setConnectionError,
    setChatId,
    setMessages
  });

  // Set up real-time subscription
  useChatSubscription({
    chatId,
    userId: user?.id,
    setMessages
  });

  // Send message functionality
  const { sendMessage } = useSendMessage({
    chatId,
    userId: user?.id,
    setMessages
  });

  // Retry functionality
  const retry = async () => {
    if (!user || !profileId) return;
    setIsLoading(true);
    setConnectionError(false);
    
    try {
      // Test connection first
      const isConnected = await testDatabaseConnection();
      if (!isConnected) {
        setConnectionError(true);
        throw new Error('Database connection failed');
      }
      
      // Re-initialize chat
      await initializeChat();
      
      toast({
        title: "Connection restored",
        description: "Chat connection has been restored successfully.",
      });
    } catch (error: any) {
      console.error('Retry failed:', error);
      
      setConnectionError(true);
      toast({
        title: "Connection failed",
        description: "Still unable to connect. Please check your network connection and try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    isLoading,
    connectionError,
    sendMessage,
    retry
  };
};
