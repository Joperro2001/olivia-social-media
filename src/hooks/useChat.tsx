
import { useState, useEffect } from "react";
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

  // Get or create chat with the matched profile
  useEffect(() => {
    const initializeChat = async () => {
      if (!user || !profileId) return;
      
      try {
        setIsLoading(true);
        
        const chatIdFromDB = await getOrCreateChat(profileId);
        setChatId(chatIdFromDB);
        
        // Fetch existing messages
        await fetchMessages(chatIdFromDB);
      } catch (error) {
        console.error('Error initializing chat:', error);
        toast({
          title: "Error",
          description: "Failed to load chat. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeChat();
  }, [user, profileId, toast]);

  // Subscribe to real-time message updates
  useEffect(() => {
    if (!chatId) return;
    
    try {
      const channel = subscribeToChat(chatId, (newMessage) => {
        // Only add messages from other users, not our own (to avoid duplicates)
        if (newMessage.sender_id !== user?.id) {
          setMessages(prev => [...prev, newMessage]);
        }
      });
      
      return () => {
        console.log('Removing channel');
        supabase.removeChannel(channel);
      };
    } catch (error) {
      console.error('Error setting up realtime subscription:', error);
      toast({
        title: "Connection Error",
        description: "Failed to set up real-time updates. Please try reloading the page.",
        variant: "destructive",
      });
    }
  }, [chatId, user?.id]);

  // Fetch existing messages
  const fetchMessages = async (chatIdToUse: string) => {
    try {
      const messagesData = await fetchChatMessages(chatIdToUse);
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
    if (!user || !content.trim() || !chatId) return false;

    try {
      const newMessage = await sendMessageToDatabase(chatId, user.id, content);
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

  return {
    messages,
    isLoading,
    sendMessage
  };
};
