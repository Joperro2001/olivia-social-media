
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

  // Get or create chat with the matched profile
  useEffect(() => {
    const initializeChat = async () => {
      if (!user || !profileId) return;
      
      try {
        setIsLoading(true);
        setConnectionError(false);
        
        // Test connection to database first
        const isConnected = await testDatabaseConnection();
        if (!isConnected) {
          setConnectionError(true);
          throw new Error('Database connection failed');
        }
        
        const chatIdFromDB = await getOrCreateChat(profileId);
        console.log('Chat initialized with ID:', chatIdFromDB);
        setChatId(chatIdFromDB);
        
        // Fetch existing messages
        await fetchMessages(chatIdFromDB);
      } catch (error) {
        console.error('Error initializing chat:', error);
        toast({
          title: "Error initializing chat",
          description: "Failed to load chat. Please try again later.",
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
      
      const channel = subscribeToChat(chatId, (newMessage) => {
        // Only add messages from other users, not our own (to avoid duplicates)
        if (newMessage.sender_id !== user.id) {
          console.log('Received real-time message:', newMessage);
          setMessages(prev => [...prev, newMessage]);
        }
      });
      
      channelRef.current = channel;
      
    } catch (error) {
      console.error('Error setting up realtime subscription:', error);
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

  // Fetch existing messages
  const fetchMessages = async (chatIdToUse: string) => {
    try {
      const messagesData = await fetchChatMessages(chatIdToUse);
      console.log(`Fetched ${messagesData.length} messages for chat:`, chatIdToUse);
      setMessages(messagesData);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages. Please try again later.",
        variant: "destructive",
      });
    }
  };

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
      const newMessage = await sendMessageToDatabase(chatId, user.id, content);
      console.log('Message sent successfully:', newMessage);
      
      // Add the message to local state immediately for better UX
      setMessages(prev => [...prev, newMessage]);
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const retry = async () => {
    if (!user || !profileId) return;
    setIsLoading(true);
    setConnectionError(false);
    
    try {
      const chatIdFromDB = await getOrCreateChat(profileId);
      setChatId(chatIdFromDB);
      await fetchMessages(chatIdFromDB);
    } catch (error) {
      console.error('Retry failed:', error);
      setConnectionError(true);
      toast({
        title: "Connection failed",
        description: "Still unable to connect. Please try again later.",
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
