
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Message } from "@/types/Chat";
import {
  fetchChatMessages,
  getOrCreateChat,
  sendMessageToDatabase,
  subscribeToChat,
  testDatabaseConnection
} from "@/utils/chatUtils";

interface UseChatProps {
  profileId: string;
}

export const useChat = ({ profileId }: UseChatProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chatId, setChatId] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<boolean>(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const retryCount = useRef<number>(0);
  const maxRetries = 3;

  // Get or create chat with the matched profile
  useEffect(() => {
    const initializeChat = async () => {
      if (!user || !profileId) {
        console.log("Missing user or profileId, cannot initialize chat");
        return;
      }
      
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
        const chatMessages = await fetchChatMessages(chatIdFromDB);
        console.log('Fetched messages:', chatMessages?.length || 0);
        setMessages(chatMessages || []);
        
        // Reset retry count on success
        retryCount.current = 0;
      } catch (error: any) {
        console.error('Error initializing chat:', error);
        console.error('Error details:', error.message, error.stack);
        
        // Check if we should retry
        if (retryCount.current < maxRetries) {
          retryCount.current += 1;
          console.log(`Retrying chat initialization (${retryCount.current}/${maxRetries})...`);
          
          // Add a small delay before retrying
          setTimeout(() => {
            initializeChat();
          }, 1000 * retryCount.current); // Increasing delay for each retry
          
          return;
        }
        
        toast({
          title: "Error initializing chat",
          description: `Failed to load chat. ${error.message || "Please try again later."}`,
          variant: "destructive",
        });
        setConnectionError(true);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeChat();
    
    // Clean up any existing channel subscription when component unmounts or profileId changes
    return () => {
      if (channelRef.current) {
        console.log('Cleaning up channel subscription');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user, profileId, toast]);

  // Subscribe to real-time message updates
  useEffect(() => {
    if (!chatId || !user?.id) return;
    
    try {
      console.log('Setting up real-time subscription for messages in chat:', chatId);
      
      // Clean up any existing subscription
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      
      // Create a new channel subscription
      const channel = supabase.channel(`public:messages:chat_id=eq.${chatId}`);
      
      channel
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `chat_id=eq.${chatId}`
          },
          (payload) => {
            console.log('Received real-time message:', payload);
            const newMessage = payload.new as Message;
            
            // Only add messages from other users, not our own (to avoid duplicates)
            if (newMessage.sender_id !== user.id) {
              console.log('Adding received message to chat');
              setMessages(prev => [...prev, newMessage]);
            }
          }
        )
        .subscribe((status) => {
          console.log('Real-time subscription status:', status);
          
          if (status !== 'SUBSCRIBED') {
            console.warn('Failed to subscribe to real-time updates:', status);
          }
        });
      
      channelRef.current = channel;
      
    } catch (error: any) {
      console.error('Error setting up realtime subscription:', error);
      console.error('Error details:', error.message, error.stack);
      
      toast({
        title: "Connection Error",
        description: "Failed to set up real-time updates. Please try reloading the page.",
        variant: "destructive",
      });
    }
    
    return () => {
      if (channelRef.current) {
        console.log('Removing channel on cleanup');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [chatId, user?.id, toast]);

  // Send a new message
  const sendMessage = async (content: string) => {
    if (!user || !content.trim() || !chatId) {
      console.log('Cannot send message: user, content, or chatId missing', {
        hasUser: !!user,
        hasContent: !!content.trim(),
        chatId
      });
      return false;
    }

    try {
      console.log('Attempting to send message to chat:', chatId);
      
      // Add more detailed logging here
      console.log('Message details:', {
        chatId,
        senderId: user.id,
        contentLength: content.length,
        timestamp: new Date().toISOString()
      });
      
      const newMessage = await sendMessageToDatabase(chatId, user.id, content);
      console.log('Message sent successfully:', newMessage);
      
      // Add the message to local state immediately for better UX
      setMessages(prev => [...prev, newMessage]);
      return true;
    } catch (error: any) {
      // More detailed error logging
      console.error('Error sending message:', error);
      console.error('Error details:', {
        errorName: error.name,
        errorMessage: error.message,
        errorStack: error.stack
      });
      
      toast({
        title: "Error",
        description: `Failed to send message: ${error.message || "Please try again."}`,
        variant: "destructive",
      });
      return false;
    }
  };

  const retry = async () => {
    if (!user || !profileId) return;
    setIsLoading(true);
    setConnectionError(false);
    retryCount.current = 0; // Reset retry count
    
    try {
      // Test connection first
      const isConnected = await testDatabaseConnection();
      if (!isConnected) {
        setConnectionError(true);
        throw new Error('Database connection failed');
      }
      
      const chatIdFromDB = await getOrCreateChat(profileId);
      setChatId(chatIdFromDB);
      const chatMessages = await fetchChatMessages(chatIdFromDB);
      setMessages(chatMessages || []);
    } catch (error: any) {
      console.error('Retry failed:', error);
      console.error('Error details:', error.message, error.stack);
      
      setConnectionError(true);
      toast({
        title: "Connection failed",
        description: `Still unable to connect: ${error.message || "Please try again later."}`,
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
