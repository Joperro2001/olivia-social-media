
import { useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { fetchChatMessages, getOrCreateChat, testDatabaseConnection } from "@/utils/chatUtils";
import { MAX_RETRIES } from "@/constants/chatConstants";
import { Message } from "@/types/Chat";

interface UseChatInitializationProps {
  userId: string | undefined;
  profileId: string;
  setIsLoading: (value: boolean) => void;
  setConnectionError: (value: boolean) => void;
  setChatId: (value: string | null) => void;
  setMessages: (messages: Message[]) => void;
}

export const useChatInitialization = ({
  userId,
  profileId,
  setIsLoading,
  setConnectionError,
  setChatId,
  setMessages
}: UseChatInitializationProps) => {
  const { toast } = useToast();
  const retryCount = useRef<number>(0);
  
  const fetchMessages = async (chatId: string): Promise<Message[]> => {
    try {
      setIsLoading(true);
      
      console.log("Fetching messages for chat ID:", chatId);
      
      const messages = await fetchChatMessages(chatId);
      setMessages(messages);
      
      return messages;
    } catch (error: any) {
      console.error("Error in fetchMessages:", error);
      
      toast({
        title: "Error loading messages",
        description: "Unable to load previous messages. Please try refreshing the page.",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const initializeChat = async () => {
    if (!userId || !profileId) return;
    
    try {
      setIsLoading(true);
      setConnectionError(false);
      
      console.log("Starting chat initialization with profile:", profileId);
      
      // Test connection to database first
      const isConnected = await testDatabaseConnection();
      if (!isConnected) {
        console.error("Database connection test failed");
        setConnectionError(true);
        throw new Error('Database connection failed');
      }
      
      // Try to get or create a chat using our RPC function
      const chatIdFromDB = await getOrCreateChat(profileId);
      console.log('Chat initialized with ID:', chatIdFromDB);
      setChatId(chatIdFromDB);
      
      // Fetch existing messages
      await fetchMessages(chatIdFromDB);
      
      // Reset retry count on success
      retryCount.current = 0;
    } catch (error: any) {
      console.error('Error initializing chat:', error);
      console.error('Error details:', {
        errorName: error.name,
        errorMessage: error.message,
        errorStack: error.stack
      });
      
      // Check if we should retry
      if (retryCount.current < MAX_RETRIES) {
        retryCount.current += 1;
        console.log(`Retrying chat initialization (${retryCount.current}/${MAX_RETRIES})...`);
        
        // Add a small delay before retrying
        setTimeout(() => {
          initializeChat();
        }, 1000 * retryCount.current); // Increasing delay for each retry
        
        return;
      }
      
      toast({
        title: "Chat Initialization Error",
        description: "Could not connect to the chat service. Please check your connection and try again.",
        variant: "destructive",
      });
      setConnectionError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initializeChat();
  }, [userId, profileId, toast]);

  return { initializeChat, fetchMessages, retryCount };
};
