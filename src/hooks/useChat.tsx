
import { useState, useEffect, useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Message } from "@/types/Chat";
import { useChatReducer } from "@/hooks/useChatReducer";
import {
  fetchChatMessages,
  getOrCreateChat,
  sendMessageToDatabase,
  testDatabaseConnection
} from "@/utils/chatUtils";

interface UseChatProps {
  profileId: string;
}

export const useChat = ({ profileId }: UseChatProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [state, dispatch] = useChatReducer();
  const [connectionError, setConnectionError] = useState<boolean>(false);
  const [retryAttempt, setRetryAttempt] = useState<number>(0);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const retryCount = useRef<number>(0);
  const maxRetries = 3;

  // Get or create chat with the matched profile
  useEffect(() => {
    let isMounted = true;
    
    const initializeChat = async () => {
      if (!user || !profileId) {
        console.log("Missing user or profileId, cannot initialize chat");
        return;
      }
      
      try {
        if (isMounted) {
          dispatch({ type: 'SET_LOADING', payload: true });
          setConnectionError(false);
        }
        
        console.log("Starting chat initialization with profile:", profileId);
        
        // Test connection to database first
        const isConnected = await testDatabaseConnection();
        if (!isConnected) {
          console.error("Database connection test failed");
          if (isMounted) {
            setConnectionError(true);
            throw new Error('Database connection failed');
          }
          return;
        }
        
        // Try to get or create a chat using our RPC function
        const chatIdFromDB = await getOrCreateChat(profileId);
        console.log('Chat initialized with ID:', chatIdFromDB);
        if (isMounted) {
          dispatch({ type: 'SET_CHAT_ID', payload: chatIdFromDB });
        }
        
        // Fetch existing messages
        const chatMessages = await fetchChatMessages(chatIdFromDB);
        console.log('Fetched messages:', chatMessages?.length || 0);
        if (isMounted) {
          dispatch({ type: 'SET_MESSAGES', payload: chatMessages || [] });
        }
        
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
            if (isMounted) {
              initializeChat();
            }
          }, 1000 * retryCount.current); // Increasing delay for each retry
          
          return;
        }
        
        if (isMounted) {
          toast({
            title: "Error initializing chat",
            description: `Failed to load chat. ${error.message || "Please try again later."}`,
            variant: "destructive",
          });
          setConnectionError(true);
        }
      } finally {
        if (isMounted) {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      }
    };
    
    initializeChat();
    
    // Clean up any existing channel subscription when component unmounts or profileId changes
    return () => {
      isMounted = false;
      if (channelRef.current) {
        console.log('Cleaning up channel subscription');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user, profileId, toast, dispatch, retryAttempt]);

  // Subscribe to real-time message updates
  useEffect(() => {
    let isMounted = true;
    
    if (!state.chatId || !user?.id) return;
    
    try {
      console.log('Setting up real-time subscription for messages in chat:', state.chatId);
      
      // Clean up any existing subscription
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      
      // Create a new channel subscription
      const channel = supabase.channel(`messages:chat_id=${state.chatId}`);
      
      channel
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `chat_id=eq.${state.chatId}`
          },
          (payload) => {
            console.log('Received real-time message:', payload);
            const newMessage = payload.new as Message;
            
            // Only add messages from other users, not our own (to avoid duplicates)
            if (newMessage.sender_id !== user.id) {
              console.log('Adding received message to chat');
              dispatch({ type: 'ADD_MESSAGE', payload: newMessage });
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
      
      if (isMounted) {
        toast({
          title: "Connection Error",
          description: "Failed to set up real-time updates. Please try reloading the page.",
          variant: "destructive",
        });
      }
    }
    
    return () => {
      isMounted = false;
      if (channelRef.current) {
        console.log('Removing channel on cleanup');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [state.chatId, user?.id, toast, dispatch]);

  // Send a new message
  const sendMessage = async (content: string) => {
    if (!user || !content.trim() || !state.chatId) {
      console.log('Cannot send message: user, content, or chatId missing', {
        hasUser: !!user,
        hasContent: !!content.trim(),
        chatId: state.chatId
      });
      return false;
    }

    try {
      console.log('Attempting to send message to chat:', state.chatId);
      
      // Add more detailed logging here
      console.log('Message details:', {
        chatId: state.chatId,
        senderId: user.id,
        contentLength: content.length,
        timestamp: new Date().toISOString()
      });
      
      const newMessage = await sendMessageToDatabase(state.chatId, user.id, content);
      console.log('Message sent successfully:', newMessage);
      
      // Add the message to local state immediately for better UX
      dispatch({ type: 'ADD_MESSAGE', payload: newMessage });
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

  const retry = useCallback(() => {
    if (!user || !profileId) return;
    
    // Increment the retry attempt to trigger the useEffect
    setRetryAttempt(prev => prev + 1);
    
    toast({
      title: "Retrying connection",
      description: "Attempting to reconnect to chat...",
    });
    
    // Reset error state immediately for user feedback
    setConnectionError(false);
    retryCount.current = 0;
  }, [user, profileId, toast]);

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    connectionError,
    sendMessage,
    retry
  };
};
